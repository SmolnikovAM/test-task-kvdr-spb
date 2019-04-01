const { dbQueryFn } = require('./db');
const { ServerError, LogicError } = require('../helpers/errors');
const {
  Table,
  Field,
  QueryBuilder,
  SQLCONST,
} = require('../helpers/queryBuilder');

class Repository {
  constructor({ from, table, map, strictMode }) {
    this.dbQueryFn = dbQueryFn;
    this.from = from || table;
    this.table = table;
    this.map = map;
    this.strictMode = strictMode;

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
    // group,
    // order,
  }) {
    let conditions = null;
    let fields = null;
    const query = new QueryBuilder(dbQueryFn);

    if (inputConditions) {
      conditions = Object.entries(inputConditions).map(([key, vals]) => {
        const field = this.mapField(key, query);
        if (typeof vals === 'object') {
          const { operator, value } = vals;
          return [field, operator, value];
        }
        return [field, vals];
      });
    }

    if (inputFields) {
      fields = inputFields.map(f => this.mapField(f));
    } else {
      fields = [new Field(SQLCONST.STAR)];
    }

    return query
      .select(fields)
      .from(this.from)
      .where(conditions)
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
    const query = new QueryBuilder(dbQueryFn);

    const { fields, values } = Object.entries(data).reduce(
      (acc, [key, vals]) => {
        const field = this.mapField(key, query);
        acc.fields.push(field);
        acc.values.push(vals);
        return acc;
      },
      { fields: [], values: [] },
    );
    return query
      .insert(this.table)
      .into(fields)
      .values(values)
      .execute();
  }

  eraseById({ id }) {
    if (!Number.isInteger(id) || id < 1) {
      throw new LogicError('id have to be strict greater zero');
    }
    const query = new QueryBuilder(dbQueryFn);
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
    const query = new QueryBuilder(dbQueryFn);

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
