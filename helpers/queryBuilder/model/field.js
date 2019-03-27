const { ServerError } = require('../../errors');
// const Table = require('./table');

const {
  TABLE_FIELD,
  STAR_FIELD,
  STAR,
  FieldProto,
  TableProto,
} = require('./constants');

class Field extends FieldProto {
  constructor(args) {
    super();
    if (args === STAR) {
      this.alias = '';
      this.type = STAR_FIELD;
      this.alias = null;
    } else {
      this.type = TABLE_FIELD;
      if (typeof args !== 'object') throw new ServerError('define field name');
      const { table, name, alias } = args;
      if (!name || !table) throw new ServerError('error defining field');
      if (!(table instanceof TableProto))
        throw new ServerError('argument not intance of Table');
      this.name = name;
      this.table = table;
      this.alias = alias || name;
    }
  }

  as(alias) {
    if (alias) this.alias = alias;
    return this;
  }
}

module.exports = Field;
