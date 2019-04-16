const Join = require('./join');
const Field = require('./field');

const {
  TableProto,
  QueryBuilderProto,
  TABLE_QUERY,
  TABLE,
  JOIN,
  QUERY,
} = require('./constants');
const { quote } = require('./helpers');

const { ServerError } = require('../../errors');

class Table extends TableProto {
  constructor(param) {
    super();
    if (param instanceof QueryBuilderProto) {
      this.type = TABLE_QUERY;
      this.query = param;
      // this.name = `(${param.toString()})`;
      this.alias = 'tableName';
    } else if (typeof param === 'string') {
      this.type = TABLE;
      this.name = param;
    } else {
      throw new ServerError('wrong input type');
    }
    this.fields = new Map();
  }

  toString(option) {
    if (this.type === TABLE_QUERY) {
      if (option === QUERY) return `(${this.query.toString()}) ${this.alias}`;
      if (option === JOIN) return `(${this.query.toString()})`;
    }
    return quote(this.name);
  }

  getParams() {
    if (this.type === TABLE_QUERY) {
      return this.query.getParams();
    }
    return [];
  }

  getAlias(table) {
    if (table !== this && table !== undefined)
      throw new ServerError('not valid table');
    return this.type === TABLE_QUERY ? this.alias : this.name;
  }

  field(inputName) {
    const name = inputName.toLowerCase();
    let field = this.fields.get(name);
    if (!field) {
      field = new Field({ name, table: this });
      this.fields.set(name, field);
    }

    return field;
  }

  leftJoin(table) {
    return new Join(this).leftJoin(table);
  }

  // rightJoin() {}

  // innerJoin() {}
}

module.exports = Table;
