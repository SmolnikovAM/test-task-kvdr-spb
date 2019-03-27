const { QueryBuilder, Table } = require('./queryBuilder');
const { ServerError } = require('../errors');
const { TABLE_ALIAS } = require('./model/constants');

describe('simple queries', () => {
  const removeSpaces = str => str.toUpperCase().replace(/\s/g, '');

  //   const tablesString = `${TABLE_BOOKS} left join ${TABLE_AUTHORS} on ${TABLE_BOOKS}.author_id = ${TABLE_AUTHORS}.id`;

  test('select * from table', () => {
    const table = new Table('table');
    const query = new QueryBuilder();
    const sql = query
      .select()
      .from(table)
      .toString();

    const ans = 'select * from `table`';
    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
  });

  test('select field1, field2 from table', () => {
    const table = new Table('table');
    const query = new QueryBuilder();
    const sql = query
      .select([table.field('field1'), table.field('field2')])
      .from(table)
      .toString();

    const ans = `
      select 
        'table'.'field1' as 'field1'
        ,'table'.'field2' as 'field2' 
      from 'table'`.replace(/'/g, '`');
    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
  });

  test('select <fields> from <two tables>', () => {
    const ta = new Table('tableA');
    const tb = new Table('tableB');
    const query = new QueryBuilder();

    const fieldsList = [ta.field('field1').as('new_name'), tb.field('field2')];
    const join = ta.leftJoin(tb).on([ta.field('id'), tb.field('table1_id')]);

    const sql = query
      .select(fieldsList)
      .from(join)
      .toString();

    const t = TABLE_ALIAS;
    const ans = `
      select 
        '${t}1'.'field1' as 'new_name'
        ,'${t}2'.'field2' as 'field2' 
      from 'tableA' '${t}1' left join 'tableB' '${t}2'on 
      ('${t}1'.'id' = '${t}2'.'table1_id')`.replace(/'/g, '`');
    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
  });

  test('select <fields> from <two tables>', () => {
    const ta = new Table('tableA');
    const tb = new Table('tableB');
    const query = new QueryBuilder();

    const fieldsList = [ta.field('field1').as('new_name'), tb.field('field2')];
    const join = ta.leftJoin(tb).on([ta.field('id'), tb.field('table1_id')]);
    const conditions = [[ta.field('fieldA'), 'test'], [54, tb.field('fieldB')]];

    const sql = query
      .select(fieldsList)
      .from(join)
      .where(conditions)
      .toString();

    const t = TABLE_ALIAS;
    const ans = `
      select 
        '${t}1'.'field1' as 'new_name'
        ,'${t}2'.'field2' as 'field2' 
      from 'tableA' '${t}1' left join 'tableB' '${t}2'on 
      ('${t}1'.'id' = '${t}2'.'table1_id')
      where '${t}1'.'fieldA' = ?
        and  ? = '${t}2'.'fieldB'
      `.replace(/'/g, '`');
    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
    expect(query.getParams()).toEqual(['test', 54]);
  });

  test('delete whole table', () => {
    const table = new Table('useless');
    const query = new QueryBuilder();

    const sql = query
      .delete()
      .from(table)
      .toString();

    const ans = `delete from 'useless'
      `.replace(/'/g, '`');

    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
  });

  test('delete table with where clause', () => {
    const table = new Table('useless');
    const query = new QueryBuilder();

    const conditions = [
      [table.field('name'), 'Ivan'],
      [table.field('salary'), 1000],
    ];

    const sql = query
      .delete()
      .from(table)
      .where(conditions)
      .toString();

    const ans = `
        delete from 'useless'
        where 'useless'.'name' = ?
          and 'useless'.'salary' = ?
      `.replace(/'/g, '`');

    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
    expect(query.getParams()).toEqual(['Ivan', 1000]);
  });

  test('simple update full table', () => {
    const table = new Table('table');
    const query = new QueryBuilder();

    const conditions = [[table.field('name'), 'Vasilisa']];
    const sql = query
      .update(table)
      .set(conditions)
      .toString();

    const ans = `
      update 'table'
      set 'table'.'name' = ?
      `.replace(/'/g, '`');
    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
    expect(query.getParams()).toEqual(['Vasilisa']);
  });

  test.skip('two tables left join', () => {
    const tableA = new Table({ name: 'name_a', fields: [] });
    const tableB = new Table('name_b');

    const query = new QueryBuilder(dbQuery);

    query
      .select(['field'])
      .from(tableA.leftJoin(tableB).on(['field1', 'field2']))
      .execute();
  });

  test.skip('select * from `table`', () => {
    const query = new QueryBuilder({ tablesString: 'test' })
      .select()
      .toString();
    const queryCheck = 'select * from test';
    expect(removeSpaces(query)).toBe(removeSpaces(queryCheck));
  });

  test.skip('select * from table', () => {
    const query = new QueryBuilder({ tablesString: 'test' })
      .select()
      .toString();
    const queryCheck = 'select * from test';
    expect(removeSpaces(query)).toBe(removeSpaces(queryCheck));
  });

  test.skip('select [fields] from table', () => {
    const query = new QueryBuilder({ tablesString: 'test' })
      .select(['field1', 'field2', 'field3'])
      .toString();
    const queryCheck =
      'select field1 as field1 ,field2 as field2 ,field3 as field3 from test';
    expect(removeSpaces(query)).toBe(removeSpaces(queryCheck));
  });

  test.skip('bad sequence of reserved words', () => {
    expect.assertions(1);
    const query = new QueryBuilder({ tablesString: 'test' });
    try {
      query.select().update();
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
    }
  });

  test.skip('empty tableString field', () => {
    expect.assertions(1);
    try {
      // eslint-disable-next-line no-new
      new QueryBuilder({});
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
    }
  });

  test.skip('update without set', async done => {
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

  test.skip('update whith set', async done => {
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
    expect(removeSpaces(arg1)).toBe(removeSpaces(queryCheck));
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
