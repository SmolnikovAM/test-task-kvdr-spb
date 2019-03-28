const {
  WhereProto,
  QueryBuilderProto,
  FieldProto,
  AND,
  WHERE,
  EQUAL,
  LIKE,
  GREATER_THAN,
  LESS_THAN,
} = require('./constants');

const { ServerError, LogicError } = require('../../errors');

class Where extends WhereProto {
  constructor({ conditions, query }) {
    super();
    this.query = query;
    this.params = [];

    if (!(query instanceof QueryBuilderProto)) {
      throw new ServerError('input parameter mistake');
    }

    this.conditions = conditions.map(condition => {
      if (
        !Array.isArray(condition) ||
        condition.length < 2 ||
        condition.length > 3
      ) {
        throw new ServerError('not valid condition');
      }
      let first = condition[0];
      let last = condition[condition.length - 1];
      let operator = EQUAL;

      if (condition.length === 3) {
        operator = [EQUAL, LIKE, GREATER_THAN, LESS_THAN].find(
          op => op.toUpperCase() === condition[1].toUpperCase(),
        );
        if (!operator) {
          throw new LogicError('not supported operator');
        }
      }

      if (!(first instanceof FieldProto)) {
        this.params.push(first);
        first = '?';
      }

      if (!(last instanceof FieldProto)) {
        this.params.push(last);
        last = '?';
      }
      return [first, operator, last];
    });
  }

  getParams() {
    return this.params;
  }

  toString() {
    const { query } = this;
    const cond = this.conditions.map(condition => {
      // eslint-disable-next-line prefer-const
      let [first, operator, last] = condition;
      if (first instanceof FieldProto) {
        first = first.getAlias({ query });
      }
      if (last instanceof FieldProto) {
        last = last.getAlias({ query });
      }
      return `${first} ${operator} ${last}`;
    });
    let str = WHERE;
    str += '\n';
    str += cond.join(`\n${AND}\n`);

    return str;
  }
}

module.exports = Where;
