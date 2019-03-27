const Table = require('./table');

jest.mock(
  './join',
  () =>
    class JoinMock {
      constructor(...args) {
        this.createArgs = args;
      }

      leftJoin(...args) {
        this.fnLeftJoin = args;
        return this;
      }
    },
);

jest.mock(
  './field',
  () =>
    class fieldMock {
      constructor(name) {
        this.name = name;
        // Object.assign(this, options);
      }
    },
);

describe('unit test for model table in QueryBuilder', () => {
  test('create table', () => {
    const name = 'name';
    const table = new Table(name);
    expect(table.name).toBe(name);
  });

  test('create join left', () => {
    const name1 = 'name1';
    const name2 = 'name2';

    const table1 = new Table(name1);
    const table2 = new Table(name2);

    const join = table1.leftJoin(table2);
    expect(join.createArgs).toEqual([table1]);
    expect(join.fnLeftJoin).toEqual([table2]);
  });

  test('create field and get field', () => {
    // eslint-disable-next-line
    const Field = require('./field');
    const table = new Table('name');

    const field1 = table.field('field1');
    const field2 = table.field('field2');
    const field1Copy1 = table.field('field1');
    const field1Copy2 = table.field('FIELd1');

    expect(
      [field1, field2, field1Copy1, field1Copy2].every(f => f instanceof Field),
    ).toBe(true);

    expect(field1).not.toBe(field2);
    expect(field1).toBe(field1Copy1);
    expect(field1).toBe(field1Copy2);
  });
});
