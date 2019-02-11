const QueryBuilder = require('.');
const { ServerError, LogicError } = require('../errors');

describe('simple queries', () => {
  const convert = str =>
    str
      .toUpperCase()
      .replace(/\n/g, ' ')
      .replace(/\s\s/g, ' ');

  test('select * from table', () => {
    const query = new QueryBuilder({ tablesString: 'test' })
      .select()
      .toString();
    const queryCheck = 'select * from test';
    expect(convert(query)).toBe(convert(queryCheck));
  });

  test('select [fields] from table', () => {
    const query = new QueryBuilder({ tablesString: 'test' })
      .select(['field1', 'field2', 'field3'])
      .toString();
    const queryCheck =
      'select field1 as field1 ,field2 as field2 ,field3 as field3 from test';
    expect(convert(query)).toBe(convert(queryCheck));
  });

  test('bad sequence of reserved words', () => {
    expect.assertions(1);
    const query = new QueryBuilder({ tablesString: 'test' });
    try {
      query.select().update();
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
    }
  });

  test('empty tableString field', () => {
    expect.assertions(1);
    try {
      // eslint-disable-next-line no-new
      new QueryBuilder({});
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
    }
  });

  test('update without set', async done => {
    expect.assertions(1);
    const stub = jest.fn(async () => ({ res: '' }));
    const query = new QueryBuilder({ tablesString: 'test', query: stub });
    try {
      await query.update().send();
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
    }
    done();
  });

  test('update whith set', async done => {
    const stub = jest.fn(async () => ({ res: '' }));

    const query = new QueryBuilder({ tablesString: 'test', query: stub });
    await query
      .update()
      .set({ field1: 'field 1', field2: 3 })
      .andWhere({ field3: 10, field4: 'test' })
      .send();

    const queryCheck =
      'update test set field1 = ? ,field2 = ? where field3 = ? and field4 = ?';
    const paramCheck = ['field 1', 3, 10, 'test'];

    const [[arg1, arg2]] = stub.mock.calls;
    expect(convert(arg1)).toBe(convert(queryCheck));
    expect(arg2).toEqual(paramCheck);
    done();
  });
});

/*
to do
select test with params and send
insert test with params and send
delete test with params and send

*/
