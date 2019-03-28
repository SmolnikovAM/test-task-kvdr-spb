const { ServerError } = require('../../errors');
const { quote } = require('./helpers');
// const Table = require('./table');

const {
  TABLE_FIELD,
  FIELDS_SELECT,
  STAR_FIELD,
  STAR,
  FieldProto,
  TableProto,
  QueryBuilderProto,
  ASC,
  DESC,
  ORDER_BY,
  DATE_DATA_TYPE,
  DEFAULT_DATE_FORMAT,
} = require('./constants');

const checkQuery = query => {
  if (!(query instanceof QueryBuilderProto)) {
    throw new ServerError('it must be a query as a parameter');
  }
};

class Field extends FieldProto {
  constructor(args) {
    super();
    if (args === STAR) {
      this.alias = '';
      this.type = STAR_FIELD;
      this.alias = null;
    } else {
      this.type = TABLE_FIELD;
      this.dataType = null;
      this.dateFormat = null;
      if (typeof args !== 'object') throw new ServerError('define field name');
      const { table, name, alias } = args;
      if (!name || !table) throw new ServerError('error defining field');
      if (!(table instanceof TableProto))
        throw new ServerError('argument not intance of Table');
      this.name = name;
      this.table = table;
      this.alias = alias || name;
      this.aliasMap = new WeakMap();
      this.orderBy = null;
      this.orderByMap = new WeakMap();
    }
  }

  setTypeDate(format = DEFAULT_DATE_FORMAT) {
    this.dataType = DATE_DATA_TYPE;
    this.dateFormat = format;
    return this;
  }

  getAlias({ query, type }) {
    if (this.type === STAR_FIELD) return STAR;
    let tableName;
    let fieldAlias;
    const fieldName = this.name;

    if (!query) {
      tableName = this.table.name;
      fieldAlias = this.alias;
    }

    if (query) {
      checkQuery(query);
      tableName = query.fromArg.getAlias(this.table);
      fieldAlias = this.aliasMap.get(query) || this.alias;
    }

    let str = `${quote(tableName)}.${quote(fieldName)}`;

    if (this.dataType === DATE_DATA_TYPE) {
      str = `DATE_FORMAT(${str}, "${this.dateFormat}")`;
    }

    if (type === FIELDS_SELECT && fieldAlias) {
      str += ` as ${quote(fieldAlias)}`;
    }

    if (type === ORDER_BY) {
      const order = this.getOrderBy(query) || '';
      str += ` ${order}`;
    }

    return str;
  }

  as(alias, query) {
    if (alias && query === undefined) {
      this.alias = alias;
    }
    if (alias && query) {
      checkQuery(query);
      this.aliasMap.set(query, alias);
    }
    return this;
  }

  setOrder({ query, type }) {
    if (query) {
      checkQuery(query);
      this.orderByMap.set(query, type);
    } else {
      this.orderBy = type;
    }
  }

  asc(query) {
    this.setOrder({ query, type: ASC });
    return this;
  }

  desc(query) {
    this.setOrder({ query, type: DESC });
    return this;
  }

  getOrderBy(query) {
    if (query) {
      checkQuery(query);
      const order = this.orderByMap.get(query);
      return order || this.orderBy;
    }
    return this.orderBy;
  }
}

module.exports = Field;
