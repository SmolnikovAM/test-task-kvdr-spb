const Join = require('./join');
const Field = require('./field');

const { TableProto } = require('./constants');

const { ServerError } = require('../../errors');

class Table extends TableProto {
  constructor(name) {
    super();
    this.name = name;
    this.fields = new Map();
  }

  getAlias(table) {
    if (table !== this && table !== undefined)
      throw new ServerError('not valid table');
    return this.name;
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
