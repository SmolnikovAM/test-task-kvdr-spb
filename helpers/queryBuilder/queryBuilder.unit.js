const { QueryBuilder, Table } = require('./queryBuilder');
const { ServerError } = require('../errors');
const { TABLE_ALIAS, DEFAULT_DATE_FORMAT } = require('./model/constants');

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

  test('select date fields from table', () => {
    const table = new Table('table');
    const query = new QueryBuilder();
    const fields = [
      table.field('field1').setTypeDate(), // DEFAULT_DATE_FORMAT = %Y-%m-%d
      table.field('field2').setTypeDate('%Y'),
    ];
    const sql = query
      .select(fields)
      .from(table)
      .toString();

    const ans = `
      select 
      DATE_FORMAT('table'.'field1', "${DEFAULT_DATE_FORMAT}") as 'field1'
      ,DATE_FORMAT('table'.'field2', "%Y") as 'field2' 
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

  test('select * from table order by', () => {
    const ta = new Table('tableA');
    const tb = new Table('tableB');
    const query = new QueryBuilder();

    const tableAId = ta.field('id');
    const tableBtaId = tb.field('table1_id');
    const onStatement = [tableAId, tableBtaId];
    const join = ta.leftJoin(tb).on(onStatement);

    const sql = query
      .select()
      .from(join)
      .orderBy([
        ta.field('name').desc(),
        tb.field('age').asc(),
        ta.field('salary'),
      ])
      .toString();

    const t = TABLE_ALIAS;
    const ans = `
      select 
        *
      from 'tableA' '${t}1' left join 'tableB' '${t}2'
      on (
        '${t}1'.'id' = '${t}2'.'table1_id'
        )
      order by 
        '${t}1'.'name' desc,
        '${t}2'.'age' asc, 
        '${t}1'.'salary'
      `.replace(/'/g, '`');

    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
  });

  test('group by testing', () => {
    const table = new Table('test');
    const [f1, f2, f3] = [1, 2, 3, 4].map(x => {
      return table.field(`name${x}`);
    });

    const query = new QueryBuilder();
    const sql = query
      .select([f2, f3])
      .from(table)
      .groupBy([f1, f2, f3])
      .toString();

    const ans = `
        select 'test'.'name2' as 'name2'
        ,'test'.'name3' as 'name3'
        from
        'test'
        groupBy 'test'.'name1'
          ,'test'.'name2'
          ,'test'.'name3'
      `.replace(/'/g, '`');

    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
  });

  test('select with limit', () => {
    const table = new Table('test');
    const query = new QueryBuilder();

    const limit = 5;
    const sql = query
      .select()
      .from(table)
      .limitOffset({ limit })
      .toString();

    const ans = `
      select
        *
      from
      'test'
      limit 5`.replace(/'/g, '`');

    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
  });

  test('select with limit and offset', () => {
    const table = new Table('test');
    const query = new QueryBuilder();

    const limit = 5;
    const offset = 10;
    const sql = query
      .select()
      .from(table)
      .limitOffset({ limit, offset })
      .toString();

    const ans = `
      select
        *
      from
      'test'
      limit 5 offset 10`.replace(/'/g, '`');

    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
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

  test('insert into table', () => {
    const table = new Table('testtable');
    const field1 = table.field('f1');

    const query = new QueryBuilder();
    const sql = query
      .insert(table)
      .into([field1])
      .values(['value1'])
      .toString();

    const ans = ` 
    insert into 'testtable' 
    ('testtable'.'f1') values(?)      
    `.replace(/'/g, '`');
    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
    expect(query.getParams()).toEqual(['value1']);
  });

  test('insert into table', () => {
    const table = new Table('testtable');
    const field1 = table.field('f1');
    const field2 = table.field('f2');
    const field3 = table.field('f3');

    const query = new QueryBuilder();
    const sql = query
      .insert(table)
      .into([field1, field2, field3])
      .values(['value1', 'value2', 'value3'])
      .values(['value4', 'value5', 'value6'])
      .toString();

    const ans = ` 
      insert into 'testtable' 
      ('testtable'.'f1', 'testtable'.'f2', 'testtable'.'f3')
      values (?, ?, ?), (?, ?, ?)
      `.replace(/'/g, '`');

    expect(removeSpaces(sql)).toBe(removeSpaces(ans));
    expect(query.getParams()).toEqual([
      'value1',
      'value2',
      'value3',
      'value4',
      'value5',
      'value6',
    ]);
  });

  test('bad sequence of reserved words', () => {
    expect.assertions(1);
    const query = new QueryBuilder();
    try {
      query.select().update();
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
    }
  });

  test('update without set', async () => {
    expect.assertions(1);
    const stub = jest.fn(async () => ({ res: '' }));
    const query = new QueryBuilder(stub);
    const table = new Table('test');
    try {
      await query.update(table).execute();
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
    }
  });

  test('update whith set', async () => {
    const stub = jest.fn(async () => ({ res: '' }));
    const table = new Table('test');
    const query = new QueryBuilder(stub);
    await query
      .update(table)
      .set([[table.field('field'), 'new value']])
      .where([[table.field('field'), 'old value']])
      .execute();

    const queryCheck = `
      update 'test' 
        set 'test'.'field' = ? 
      where 'test'.'field' = ?   
    `.replace(/'/g, '`');
    const paramCheck = ['new value', 'old value'];
    const [[arg1, arg2]] = stub.mock.calls;
    expect(removeSpaces(arg1)).toBe(removeSpaces(queryCheck));
    expect(arg2).toEqual(paramCheck);
  });
});
