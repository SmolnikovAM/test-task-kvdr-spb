const {
  ServerError,
  LogicError,
  BadRequestError,
  MYSQL_ERRORS,
} = require('../helpers/errors');

const {
  Table,
  Field,
  QueryBuilder,
  SQLCONST,
} = require('../helpers/queryBuilder');

function equal(s1, s2) {
  return s1.toLowerCase() === s2.toLowerCase();
}

class Repository {
  constructor({ from, table, map, strictMode, queryFn }) {
    this.from = from || table;
    this.table = table;
    this.map = map;
    this.strictMode = strictMode;
    this.queryFn = queryFn;

    if (strictMode) {
      if (!map) throw new ServerError('map is required in strict query');
    }
    if (map && !(map instanceof Map)) {
      throw new ServerError('bad iput parameter');
    }
    if (map) {
      map.forEach(val => {
        if (!(Reflect.has(val, 'field') && Reflect.has(val, 'field'))) {
          throw new ServerError('map must have {fields, alias} structure');
        }
      });
    }
  }

  mapFieldNames(key) {
    if (this.map) {
      const data = this.map.get(key);
      if (this.strictMode && !data) {
        throw new LogicError('field not in list');
      }
      return data || { field: key, alias: key };
    }
    return { field: key, alias: key };
  }

  mapField(key, query) {
    const { alias, field, table } = this.mapFieldNames(key);
    const args = [alias];
    if (query) args.push(query);
    if (!table) {
      if (!(this.from instanceof Table)) {
        throw new ServerError('must be a table');
      }
      return this.from.field(field).as(...args);
    }
    return table.field(field).as(...args);
  }

  async find({
    conditions: inputConditions,
    fields: inputFields,
    pagination,
    group: inputGroup,
    order: inputOrder,
  }) {
    let conditions = null;
    let fields = null;
    let group = null;
    let order = null;
    const query = new QueryBuilder(this.queryFn);

    if (inputGroup) {
      group = inputFields.map(f => this.mapField(f, query));
    }

    if (inputOrder) {
      order = inputOrder.map(data => {
        if (typeof data === 'string') {
          return this.mapField(data, query);
        }
        const { field, direction } = data;
        if (equal(direction, SQLCONST.ASC)) {
          return this.mapField(field, query).asc(query);
        }
        if (equal(direction, SQLCONST.DESC)) {
          return this.mapField(field, query).desc(query);
        }
        return this.mapField(field, query);
      });
    }

    if (inputConditions) {
      conditions = inputConditions.reduce((a, cond) => {
        const newCond = Object.entries(cond).map(([key, vals]) => {
          const field = this.mapField(key, query);
          if (typeof vals === 'object') {
            const { operator, value } = vals;
            return [field, operator, value];
          }
          return [field, vals];
        });
        return [...a, ...newCond];
      }, []);
    }

    if (inputFields) {
      fields = inputFields.map(f => this.mapField(f, query));
    } else {
      fields = [new Field(SQLCONST.STAR)];
    }

    return query
      .select(fields)
      .from(this.from)
      .where(conditions)
      .groupBy(group)
      .orderBy(order)
      .limitOffset(pagination)
      .execute();
  }

  async findOne(...options) {
    const [one] = await this.find(...options);
    return one;
  }

  // append single
  async append(data) {
    if (!(this.from instanceof Table)) {
      throw new ServerError('not a table');
    }
    if (data && typeof data !== 'object') {
      throw new LogicError('incorrect type to append');
    }
    const query = new QueryBuilder(this.queryFn);

    const { fields, values } = Object.entries(data).reduce(
      (acc, [key, vals]) => {
        const field = this.mapField(key, query);
        acc.fields.push(field);
        acc.values.push(vals);
        return acc;
      },
      { fields: [], values: [] },
    );

    try {
      const res = await query
        .insert(this.table)
        .into(fields)
        .values(values)
        .execute();
      return res;
    } catch (e) {
      if (e.code === MYSQL_ERRORS.ER_DUP_ENTRY) {
        throw new BadRequestError('Duplicate entry');
      }
      throw e;
    }
  }

  eraseById({ id }) {
    if (!Number.isInteger(id) || id < 1) {
      throw new LogicError('id have to be strict greater zero');
    }
    const query = new QueryBuilder(this.queryFn);
    const condition = [this.mapField('id', query), id];
    return query
      .delete()
      .from(this.table)
      .where([condition])
      .execute();
  }

  editById({ id, ...inputSetState }) {
    if (!Number.isInteger(id) || id < 1) {
      throw new LogicError('id have to be strict greater zero');
    }
    if (!inputSetState) {
      throw new LogicError('empty set params');
    }
    const query = new QueryBuilder(this.queryFn);

    const setState = Object.entries(inputSetState).map(([key, vals]) => [
      this.mapField(key, query),
      vals,
    ]);

    const condition = [this.mapField('id', query), id];

    return query
      .update(this.table)
      .set(setState)
      .where([condition])
      .execute();
  }
}

module.exports = Repository;
