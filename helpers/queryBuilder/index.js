const { ServerError, LogicError } = require('../errors');

const SELECT = 'select';
const INSERT_INTO = 'insert into';
const UPDATE = 'update';
const DELETE = 'delete';
const FROM = 'from';
const VALUES = 'values';
const SET = 'set';
const WHERE = 'where';
const AND = 'and';
const GROUP_BY = 'group by';
const ORDER_BY = 'order by';
const LIMIT = 'limit';
const OFFSET = 'offset';

class QueryBuilder {
  constructor({ tablesString, query, fieldRules }) {
    if (typeof tablesString !== 'string' || tablesString === '') {
      throw new ServerError('not right insert params');
    }
    this.stack = [];
    this.tables = tablesString;
    this.params = [];
    this.insertFields = [];
    this.query = query;
    this.state = null;
    this.type = null;
    this.fieldRules = fieldRules || {};
  }

  fieldMap(field, type) {
    const f =
      this.fieldRules[field] === undefined ? field : this.fieldRules[field];

    const fieldAs = field === 'count(*)' ? 'cnt' : field;
    return `${f}${type === SELECT ? ` as ${fieldAs}` : ''}`;
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
    if (this.state !== null) throw new ServerError();
    this.state = SELECT;
    this.type = this.state;
    if (fields && fields.length > 0) {
      const fieldsSelect = fields.map(f => this.fieldMap(f, this.type));
      this.stack.push(`${SELECT}\n${fieldsSelect.join('\n,')}`);
    } else {
      this.stack.push(`${SELECT}\n*`);
    }
    return this.from();
  }

  from() {
    if ([SELECT, DELETE].indexOf(this.state) === -1) throw new ServerError();
    this.state = FROM;
    this.stack.push(FROM);
    this.stack.push(this.tables);
    return this;
  }

  delete() {
    if (this.state !== null) throw new ServerError();
    this.state = DELETE;
    this.type = this.state;
    this.stack.push(`${DELETE}`);
    return this.from();
  }

  update() {
    if (this.state !== null) throw new ServerError();
    this.state = UPDATE;
    this.type = this.state;
    this.stack.push(`${UPDATE} ${this.tables}`);
    return this;
  }

  set(fields) {
    if ([SET, UPDATE].indexOf(this.state) === -1) throw new ServerError();

    if (fields) {
      Object.entries(fields).forEach(([key, val]) => {
        const newKey = this.fieldMap(key);
        if (this.state === SET) {
          this.stack.push(`,${newKey} = ?`);
        }
        if (this.state === UPDATE) {
          this.stack.push(`SET ${newKey} = ?`);
          this.state = SET;
        }
        this.params.push(val);
      });
    }
    return this;
  }

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

  andWhere(conditions) {
    if ([FROM, SET].indexOf(this.state) === -1) throw new ServerError();

    const addParam = (key, val, oper) => {
      const newKey = this.fieldMap(key);

      if (this.state === WHERE) {
        this.stack.push(`${AND} ${newKey} ${oper} ?`);
      } else {
        this.stack.push(`${WHERE} ${newKey} ${oper} ?`);
        this.state = WHERE;
      }
      this.params.push(val);
    };

    if (conditions) {
      Object.entries(conditions).forEach(([key, val]) => {
        if (['<', '>', '=<', '=>', '%'].indexOf(key) >= 0) {
          Object.entries(val).forEach(([keyChild, valChild]) => {
            addParam(keyChild, valChild, key === '%' ? 'like' : key);
          });
        } else {
          addParam(key, val, '=');
        }
      });
    }
    return this;
  }

  toString() {
    // console.log(this.stack.join('\n'));
    return this.stack.join('\n');
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

  sortBy(options) {
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

  send() {
    if ([INSERT_INTO, UPDATE].indexOf(this.state) !== -1) {
      throw new ServerError('sql is not ready for sending');
    }

    return this.query(this.toString(), this.params).then(({ res }) => res);
  }
}

module.exports = QueryBuilder;
