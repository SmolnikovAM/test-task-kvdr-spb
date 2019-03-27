const Join = require('./join');
const { TableProto, FieldProto, TABLE_ALIAS } = require('./constants');

class Field extends FieldProto {
  constructor({ name, table }) {
    super();
    this.name = name;
    this.table = table;
    this.alias = name;
  }
}

class Table extends TableProto {
  constructor(name) {
    super();
    this.name = name;
    this.fields = {};
  }

  field(name) {
    this.fields[name] = this.fields[name]
      ? this.fields[name]
      : new Field({ name, table: this });
    return this.fields[name];
  }
}

describe('testing Join class', () => {
  const removeSpaces = str =>
    str
      .toUpperCase()
      .replace(/\n/g, '')
      .replace(/\s/g, '');

  test('two tables', () => {
    const table1 = new Table('table1');
    const table2 = new Table('table2');
    const exp = `
      \`table1\` \`${TABLE_ALIAS}1\`
      left join \`table2\` \`${TABLE_ALIAS}2\`
      on
      (
      \`${TABLE_ALIAS}1\`.\`fieldTable1\` = \`${TABLE_ALIAS}2\`.\`fieldTable2\`
      )`;

    const join = new Join(table1)
      .leftJoin(table2)
      .on([table1.field('fieldTable1'), table2.field('fieldTable2')]);

    expect(removeSpaces(join.toString())).toBe(removeSpaces(exp));
  });

  test('three tables', () => {
    const table1 = new Table('table1');
    const table2 = new Table('table2');
    const table3 = new Table('table3');
    const a = TABLE_ALIAS;

    const join = new Join(table1)
      .leftJoin(table2)
      .on([table1.field('id'), table2.field('table1_id')])
      .leftJoin(table3)
      .on(
        [table2.field('table3_id'), table3.field('id')],
        [table2.field('table3_flag'), table3.field('flag')],
      );

    const exp = `
      \`table1\` \`${a}1\`
      left join \`table2\` \`${a}2\`
      on
      (
      \`${a}1\`.\`id\` = \`${a}2\`.\`table1_id\`
      )
      left join \`table3\` \`${a}3\`
      on
      (
      \`${a}2\`.\`table3_id\` = \`${a}3\`.\`id\`
        and
      \`${a}2\`.\`table3_flag\` = \`${a}3\`.\`flag\`
      )`;

    expect(removeSpaces(join.toString())).toBe(removeSpaces(exp));
  });
});
