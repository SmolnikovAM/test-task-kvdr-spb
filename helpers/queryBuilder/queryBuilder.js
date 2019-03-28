const Field = require('./model/field');
const Table = require('./model/table');
const Join = require('./model/join');
const Where = require('./model/where');

const {
  QueryBuilderProto,
  SELECT,
  INSERT_INTO,
  INSERT,
  INTO,
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
  STAR,
  KEYWORD,
  FIELDS_SELECT,
  TABLE,
  JOIN,
} = require('./model/constants');

const { quote, checkNumber } = require('./model/helpers');
const { ServerError, LogicError } = require('../errors');

class QueryBuilder extends QueryBuilderProto {
  constructor(dbQueryFn) {
    super();
    this.stack = [];
    this.fromArg = null;
    this.params = [];
    this.insertFields = null;
    if (dbQueryFn) {
      if (typeof dbQueryFn !== 'function') {
        throw new ServerError('input parameter must be a function');
      }
      this.dbQueryFn = dbQueryFn;
    }
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
    this.insertFields = null;
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
    if ([SELECT, DELETE, UPDATE, INSERT].indexOf(this.state) === -1) {
      throw new ServerError('incorrect syntax');
    }
    if (
      [DELETE, UPDATE, INSERT].indexOf(this.state) !== -1 &&
      !(fromArg instanceof Table)
    ) {
      throw new ServerError('must be a table');
    }
    if (!(fromArg instanceof Join || fromArg instanceof Table)) {
      throw new ServerError('incorrect from statement');
    }

    if ([UPDATE, INSERT].indexOf(this.type) === -1) {
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

  insert(table) {
    if (this.state !== null) throw new ServerError('bad sequence');
    this.state = INSERT;
    this.type = INSERT;
    this.stack.push([KEYWORD, INSERT_INTO]);
    this.from(table);
    return this;
  }

  into(fields) {
    if (this.state !== INSERT) throw new ServerError('bad sequence');
    if (!Array.isArray(fields)) throw new ServerError('not array value');
    if (!fields.every(f => f instanceof Field))
      throw new ServerError('not a fields');
    this.insertFields = fields;
    this.stack.push([INTO, fields]);
    this.state = INTO;
    return this;
  }

  values(vals) {
    if ([VALUES, INTO].indexOf(this.state) === -1) {
      throw new ServerError();
    }
    if (!vals) {
      throw new ServerError('SQLBuilder. No data to insert');
    }
    if (!Array.isArray(vals)) {
      throw new ServerError('vals not array');
    }
    if (vals.length !== this.insertFields.length)
      throw new ServerError('length of values and fields liset are not equal');

    const str = `${this.state === VALUES ? ',' : ''}(${vals
      .map(() => '?')
      .join(',')})`;

    if (this.state === INTO) {
      this.state = VALUES;
      this.stack.push([KEYWORD, VALUES]);
    }

    this.params.push(...vals);
    this.stack.push([VALUES, str]);

    return this;
  }

  where(conditions) {
    if (conditions === undefined) return this;
    if ([FROM, SET].indexOf(this.state) === -1)
      throw new ServerError('bad sequence');
    if (!Array.isArray(conditions))
      return new ServerError('conditions must be arrays');
    const where = new Where({ conditions, query: this });
    this.stack.push([WHERE, where]);
    this.params.push(...where.getParams());
    this.state = WHERE;
    return this;
  }

  toStringFields({ data, type }) {
    const fieldsStrings = data.map(f => f.getAlias({ query: this, type }));
    return fieldsStrings.join(',');
  }

  groupBy(fields) {
    if ([FROM, WHERE].indexOf(this.state) === -1) throw new ServerError();
    if (this.type !== SELECT) throw new ServerError();

    if (fields) {
      if (!Array.isArray(fields)) {
        throw new ServerError('parameter is not array');
      }
      this.state = GROUP_BY;
      this.stack.push([KEYWORD, GROUP_BY]);
      this.stack.push([GROUP_BY, fields]);
    }
    return this;
  }

  orderBy(fields) {
    if ([FROM, WHERE, GROUP_BY].indexOf(this.state) === -1) {
      throw new ServerError();
    }
    if (this.type !== SELECT) {
      throw new ServerError();
    }

    if (fields) {
      if (!fields.every(f => f instanceof Field)) {
        throw new ServerError();
      }
      this.state = ORDER_BY;
      this.stack.push([KEYWORD, ORDER_BY]);
      this.stack.push([ORDER_BY, fields]);
    }
    return this;
  }

  toString() {
    if ([SELECT, INSERT, INTO, UPDATE].indexOf(this.state) !== -1) {
      throw new ServerError('sql is not ready for sending');
    }

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

      if (type === INTO) {
        add(`(${this.toStringFields({ data, type })})`);
      }

      if (type === ORDER_BY) {
        add(this.toStringFields({ data, type }));
      }

      if (type === GROUP_BY) {
        add(this.toStringFields({ data, type }));
      }

      if (type === VALUES) {
        add(data);
      }

      if (type === LIMIT) {
        add(data);
      }
    });

    return str;
  }

  limitOffset({ limit, offset }) {
    if (this.type !== SELECT) {
      throw new ServerError('limit can be only in slelect statement');
    }
    if ([FROM, WHERE, GROUP_BY, ORDER_BY].indexOf(this.state) === -1) {
      throw new ServerError('not correct sequence');
    }

    if (limit !== undefined) {
      if (!checkNumber(limit)) throw new LogicError('not correct input data');
    }

    if (offset !== undefined) {
      if (!checkNumber(limit)) throw new LogicError('not correct input data');
    }

    if (limit) {
      const str = `${LIMIT} ${limit} ${offset ? `${OFFSET} ${offset}` : ''}`;
      this.stack.push([LIMIT, str]);
      this.state = LIMIT;
    }

    return this;
  }

  execute() {
    if ([SELECT, INSERT, INTO, UPDATE].indexOf(this.state) !== -1) {
      throw new ServerError('sql is not ready for sending');
    }
    return this.dbQueryFn(this.toString(), this.params).then(({ res }) => res);
  }
}

module.exports = { QueryBuilder, Table, Field };
