const Field = require('./model/field');
const Table = require('./model/table');
const Join = require('./model/join');
const Where = require('./model/where');

const {
  SELECT,
  INSERT_INTO,
  UPDATE,
  DELETE,
  FROM,
  VALUES,
  SET,
  WHERE,
  GROUP_BY,
  ORDER_BY,
  LIMIT,
  OFFSET,
  AND,
  TABLE_FIELD,
  STAR_FIELD,
  STAR,
  KEYWORD,
  FIELDS_SELECT,
  TABLE,
  JOIN,
} = require('./model/constants');

const quote = str => `\`${str}\``;

const { ServerError, LogicError } = require('../errors');

// const SINGLE_TABLE_SELECT = Symbol('single table select');
// const MULT_TABLE_SELECT = Symbol('mult table select');

class QueryBuilder {
  constructor(db) {
    this.stack = [];
    this.fromArg = null;
    this.params = [];
    this.insertFields = [];
    this.db = db;
    this.state = null;
    this.type = null;
    this.whereConditions = null;
    this.updateSet = null;
  }

  getParams() {
    return this.params;
  }

  clear() {
    this.stack.length = 0;
    this.params.length = 0;
    this.state = null;
    this.type = null;
    this.insertFields = [];
    this.fieldRules = {};
  }

  select(fields) {
    if (this.state !== null) throw new ServerError('sequence error');
    this.state = SELECT;
    this.type = SELECT;
    this.stack.push([KEYWORD, SELECT]);
    if (fields === undefined) {
      this.stack.push([FIELDS_SELECT, [new Field(STAR)]]);
      return this;
    }

    if (!fields.every(f => f instanceof Field))
      throw new ServerError('not a field error');

    this.stack.push([FIELDS_SELECT, fields]);

    return this;
  }

  from(fromArg) {
    if ([SELECT, DELETE, UPDATE].indexOf(this.state) === -1) {
      throw new ServerError('incorrect syntax');
    }
    if (
      [DELETE, UPDATE].indexOf(this.state) !== -1 &&
      !(fromArg instanceof Table)
    ) {
      throw new ServerError('must be a table');
    }
    if (!(fromArg instanceof Join || fromArg instanceof Table)) {
      throw new ServerError('incorrect from statement');
    }

    if (this.type !== UPDATE) {
      this.stack.push([KEYWORD, FROM]);
      this.state = FROM;
    }

    this.fromArg = fromArg;
    const type = fromArg instanceof Table ? TABLE : JOIN;
    this.stack.push([type, fromArg]);
    return this;
  }

  delete() {
    if (this.state !== null) throw new ServerError('Bad sequence');
    this.state = DELETE;
    this.type = DELETE;
    this.stack.push([KEYWORD, DELETE]);
    return this;
  }

  update(table) {
    if (!table) throw new ServerError('table parameter mustnt be empty');
    if (this.state !== null) throw new ServerError();
    this.state = UPDATE;
    this.type = this.state;
    this.stack.push([KEYWORD, UPDATE]);
    return this.from(table);
  }

  set(statements) {
    if ([SET, UPDATE].indexOf(this.state) === -1) throw new ServerError();
    if (!Array.isArray(statements)) throw new ServerError('must be array');
    if (this.state === UPDATE) {
      this.state = SET;
      this.stack.push([KEYWORD, SET]);
      this.updateSet = [];
      this.stack.push([SET, this.updateSet]);
    }

    const createAlias = field =>
      `${quote(this.fromArg.getAlias(field.table))}.${quote(field.name)}`;

    statements.forEach(([left, right]) => {
      if (!(left instanceof Field)) throw new ServerError('not valid syntax');
      const leftStr = createAlias(left);
      let rightStr;
      if (right instanceof Field) {
        rightStr = createAlias(right);
      } else {
        rightStr = '?';
        this.params.push(right);
      }
      this.updateSet.push(`${leftStr} = ${rightStr}`);
    });

    return this;
  }

  /*
  insert() {
    if (this.state !== null) throw new ServerError();
    this.state = INSERT_INTO;
    this.type = this.state;
    this.stack.push(`${INSERT_INTO} ${this.tables}`);
    return this;
  }

  values(fields) {
    if ([VALUES, INSERT_INTO].indexOf(this.state) === -1)
      throw new ServerError();
    if (!fields) throw new ServerError('SQLBuilder. No data to insert');

    if (this.state === VALUES) {
      const values = [];
      const namesFields = [];
      Object.entries(fields).forEach(([key, val]) => {
        const newKey = this.fieldMap(key);
        values.push(val);
        namesFields.push(newKey);
      });

      if (namesFields.length !== this.insertFields.length) {
        throw new ServerError('not valid multiple insert');
      }

      while (namesFields.length) {
        if (this.insertFields.indexOf(namesFields.pop()) === -1)
          throw new ServerError('not valid multiple insert');
      }
      this.stack.push(`,(${values.map(() => '?').join(', ')})`);
      this.params.push(...values);
    } else if (this.state === INSERT_INTO) {
      this.state = VALUES;
      this.insertFields = [];
      const values = [];

      Object.entries(fields).forEach(([key, val]) => {
        const newKey = this.fieldMap(key);
        this.insertFields.push(newKey);
        values.push(val);
      });
      this.stack.push(`(${this.insertFields.join(',')})`);
      this.stack.push(`${VALUES}(${values.map(() => '?').join(', ')})`);
      this.params.push(...values);
    }
    return this;
  }
*/

  where(conditions) {
    if (conditions === undefined) return this;
    if ([FROM, SET].indexOf(this.state) === -1)
      throw new ServerError('bad sequence');
    if (!Array.isArray(conditions)) return new ServerError();
    const where = new Where({ conditions, from: this.fromArg });
    this.stack.push([WHERE, where]);
    this.params.push(...where.getParams());
    this.state = WHERE;
    return this;
  }

  toStringFields({ data, type }) {
    const fieldsStrings = data.reduce((arr, f) => {
      if (f.type === STAR_FIELD) {
        arr.push(STAR);
      }
      if (f.type === TABLE_FIELD) {
        const table = this.fromArg.getAlias(f.table);
        let str = `${quote(table)}.${quote(f.name)}`;
        str += f.alias && type === FIELDS_SELECT ? ` as ${quote(f.alias)}` : '';
        arr.push(str);
      }
      return arr;
    }, []);

    return fieldsStrings.join(',');
  }

  toString() {
    let str = '';
    const add = arg => {
      str = `${str}${arg}\n`;
    };

    this.stack.forEach(([type, data]) => {
      if (type === KEYWORD) {
        add(data);
      }

      if (type === FIELDS_SELECT) {
        add(this.toStringFields({ data, type }));
      }

      if (type === TABLE) {
        add(quote(data.name));
      }

      if (type === JOIN) {
        add(data.toString());
      }

      if (type === WHERE) {
        add(data.toString());
      }

      if (type === SET) {
        add(data.join(','));
      }
    });

    return str;
  }

  groupBy(options) {
    if ([FROM, WHERE].indexOf(this.state) === -1) throw new ServerError();
    if (this.type !== SELECT) throw new ServerError();

    if (options) {
      this.state = GROUP_BY;
      this.stack.push(GROUP_BY);
      this.stack.push(options.map(key => this.fieldMap(key)).join(',\n'));
    }
    return this;
  }
  /*
  orderBy(options) {
    if ([FROM, WHERE, GROUP_BY].indexOf(this.state) === -1)
      throw new ServerError();
    if (this.type !== SELECT) throw new ServerError();

    if (options) {
      this.state = ORDER_BY;
      this.stack.push(ORDER_BY);
      this.stack.push(options.map(key => this.fieldMap(key)).join(',\n'));
    }
    return this;
  }

  pagination(options) {
    if (this.type !== SELECT) throw new ServerError();
    if ([FROM, WHERE, GROUP_BY, ORDER_BY].indexOf(this.state) === -1)
      throw new ServerError();

    if (!options) return this;

    const { limit, offset } = options;
    if (
      !Number.isInteger(limit) ||
      !Number.isInteger(offset) ||
      limit <= 0 ||
      offset <= 0
    )
      throw new LogicError('pagination params is not natural numbers');
    this.stack.push(`${LIMIT} ${limit}`);
    this.stack.push(`${OFFSET} ${offset}`);
    this.state = LIMIT;

    return this;
  }
*/

  execute() {
    if ([INSERT_INTO, UPDATE].indexOf(this.state) !== -1) {
      throw new ServerError('sql is not ready for sending');
    }

    return this.query(this.toString(), this.params).then(({ res }) => res);
  }
}

module.exports = { QueryBuilder, Table, Field };
