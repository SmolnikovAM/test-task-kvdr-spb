const { WhereProto, AND, FieldProto, WHERE } = require('./constants');

const { ServerError } = require('../../errors');

const quote = str => `\`${str}\``;

class Where extends WhereProto {
  constructor({ conditions, from }) {
    super();
    this.from = from;
    this.params = [];

    this.conditions = conditions.map(condition => {
      if (!Array.isArray(condition) || condition.length < 2)
        throw new ServerError('not valid condition');
      let first = condition[0];
      let last = condition[condition.length - 1];

      if (!(first instanceof FieldProto)) {
        this.params.push(first);
        first = '?';
      }

      if (!(last instanceof FieldProto)) {
        this.params.push(last);
        last = '?';
      }
      return [first, last];
    });
  }

  getParams() {
    return this.params;
  }

  toString() {
    const cond = this.conditions.map(condition => {
      let first = condition[0];
      let last = condition[condition.length - 1];
      const createAlias = field =>
        `${quote(this.from.getAlias(field.table))}.${quote(field.name)}`;

      if (first instanceof FieldProto) {
        first = createAlias(first);
      }
      if (last instanceof FieldProto) {
        last = createAlias(last);
      }
      return `${first} = ${last}`;
    });
    let str = WHERE;
    str += '\n';
    str += cond.join(`\n${AND}\n`);

    return str;
  }
}

module.exports = Where;
