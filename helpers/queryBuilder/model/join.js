const { ServerError } = require('../../errors');

const {
  TABLE,
  LEFT_JOIN,
  ON,
  AND,
  ERROR_MSG_BAD_SEQUANCE,
  ERROR_MSG_JOIN_SAME_TABLE,
  ERROR_MSG_BAD_ON_SYNTAX,
  ERROR_MSG_NOT_A_TABLE,
  TABLE_ALIAS,
  TableProto,
  FieldProto,
  JoinProto,
  TABLE_QUERY,
  JOIN,
} = require('./constants');

const JOINS_ARRAY = [LEFT_JOIN];

const quote = str => `\`${str}\``;

class Join extends JoinProto {
  constructor(table) {
    super();
    if (!(table instanceof TableProto))
      throw new ServerError(ERROR_MSG_NOT_A_TABLE);
    this.tablesParams = new Map();
    this.status = TABLE;
    this.tableCounter = 1;
    this.tablesParams.set(table, { alias: this.aliasName() });
    this.data = [{ status: TABLE, table }];
    this.type = JOIN;
    this.params = [...table.getParams()];
  }

  getParams() {
    return this.params;
  }

  getAlias(table) {
    const data = this.tablesParams.get(table);
    return data ? data.alias : undefined;
  }

  aliasName() {
    const newName = `${TABLE_ALIAS}${this.tableCounter}`;
    this.tableCounter += 1;
    return newName;
  }

  setInfoForTable({ table, options: initOptions }) {
    const params = this.tablesParams.get(table);
    const options = initOptions || { alias: this.aliasName() };

    if (!params) {
      this.tablesParams.set(table, options);
    } else {
      Object.assign(params, options);
    }
  }

  leftJoin(table) {
    if ([TABLE, ON].indexOf(this.status) === -1)
      throw new ServerError(ERROR_MSG_BAD_SEQUANCE);
    if (this.tablesParams.get(table))
      throw new ServerError(ERROR_MSG_JOIN_SAME_TABLE);
    this.status = LEFT_JOIN;
    this.setInfoForTable({ table });
    this.params.push(...table.getParams());
    this.data.push({ table, status: LEFT_JOIN });
    return this;
  }

  on(...expressions) {
    if (JOINS_ARRAY.indexOf(this.status) === -1)
      throw new ServerError(ERROR_MSG_BAD_SEQUANCE);

    this.status = ON;
    const check = expressions.some(expr => {
      if (!Array.isArray(expr)) return true;
      if (expr.length < 2) return true;
      if (!(expr[0] instanceof FieldProto)) return true;
      if (!(expr[expr.length - 1] instanceof FieldProto)) return true;
      return false;
    });
    if (check) throw new ServerError(ERROR_MSG_BAD_ON_SYNTAX);

    this.data.push({ status: ON, expressions });
    return this;
  }

  toString() {
    if (JOINS_ARRAY.indexOf(this.status) !== -1)
      throw new ServerError(ERROR_MSG_BAD_SEQUANCE);
    const str = [];

    this.data.forEach(({ status, table, expressions }) => {
      if (status === TABLE) {
        const { alias } = this.tablesParams.get(table);
        // const tableName =
        //   table.type === TABLE_QUERY ? table.name : quote(table.name);
        str.push(`${table.toString(JOIN)} ${quote(alias)}`);
      }

      if (JOINS_ARRAY.indexOf(status) !== -1) {
        const { alias } = this.tablesParams.get(table);
        str.push(`${status} ${table.toString(JOIN)} ${quote(alias)}`);
      }

      if (status === ON) {
        str.push(`on`);
        str.push(`(`);
        expressions.forEach((expression, index) => {
          const first = expression[0];
          const last = expression[expression.length - 1];
          const firstTableAlias = this.tablesParams.get(first.table).alias;
          const lastTableAlias = this.tablesParams.get(last.table).alias;

          if (index) str.push(AND);
          str.push(
            `${quote(firstTableAlias)}.${quote(first.name)} = ${quote(
              lastTableAlias,
            )}.${quote(last.name)}`,
          );
        });
        str.push(`)`);
      }
    });

    return str.join('\n');
  }
}

module.exports = Join;
