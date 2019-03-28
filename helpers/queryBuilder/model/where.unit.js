const Where = require('./where');
const { LogicError } = require('../../errors');

const { FieldProto, QueryBuilderProto } = require('./constants');

describe('test where statement ', () => {
  const removeSpaces = str => str.toUpperCase().replace(/\s/g, '');

  test('single where clause with one condition. from table', () => {
    const query = new QueryBuilderProto();
    const field = new FieldProto();
    field.getAlias = () => '`test`.`fieldName`';

    const conditions = [[field, 'test value']];
    const where = new Where({ conditions, query });
    const ans = `
    where 'test'.'fieldName' = ?    
    `.replace(/'/g, '`');

    expect(removeSpaces(where.toString())).toBe(removeSpaces(ans));
    expect(where.getParams()).toEqual(['test value']);
  });

  test('where clause with two conditions. from table', () => {
    const query = new QueryBuilderProto();
    const field1 = new FieldProto();
    const field2 = new FieldProto();
    field1.getAlias = () => '`tableName`.`fieldName1`';
    field2.getAlias = () => '`tableName`.`fieldName2`';

    const fieldVal1 = 'test value';
    const fieldVal2 = 54;
    const conditions = [[field1, fieldVal1], [field2, fieldVal2]];
    const where = new Where({ conditions, query });
    const ans = `
    where 'tableName'.'fieldName1' = ?    
      and 'tableName'.'fieldName2' = ?    
    `.replace(/'/g, '`');

    expect(removeSpaces(where.toString())).toBe(removeSpaces(ans));
    expect(where.getParams()).toEqual([fieldVal1, fieldVal2]);
  });

  test('where clause with two conditions. from two tables', () => {
    const query = new QueryBuilderProto();
    const [f1, f2, f3, f4] = [0, 0, 0, 0].map(() => new FieldProto());
    Object.assign(f1, { getAlias: () => '`tableName1`.`f1`' });
    Object.assign(f2, { getAlias: () => '`tableName1`.`f2`' });
    Object.assign(f3, { getAlias: () => '`tableName2`.`f3`' });
    Object.assign(f4, { getAlias: () => '`tableName2`.`f4`' });

    const field2Val = 3;
    const field4Val = 'test value';

    const conditions = [[f1, f3], [f2, field2Val], [f4, field4Val]];
    const where = new Where({ conditions, query });
    const ans = `
    where 'tableName1'.'f1' = 'tableName2'.'f3'    
      and 'tableName1'.'f2' = ?    
      and 'tableName2'.'f4' = ?    
    `.replace(/'/g, '`');

    expect(removeSpaces(where.toString())).toBe(removeSpaces(ans));
    expect(where.getParams()).toEqual([field2Val, field4Val]);
  });

  test('where clause with different operators', () => {
    const query = new QueryBuilderProto();
    const [f1, f2, f3, f4] = [0, 0, 0, 0].map(() => new FieldProto());
    Object.assign(f1, { getAlias: () => '`tableName1`.`f1`' });
    Object.assign(f2, { getAlias: () => '`tableName1`.`f2`' });
    Object.assign(f3, { getAlias: () => '`tableName2`.`f3`' });
    Object.assign(f4, { getAlias: () => '`tableName2`.`f4`' });

    const field2Val = 'test%';
    const field4Val1 = 34;
    const field4Val2 = 20;

    const conditions = [
      [f1, '=', f3],
      [f2, 'like', field2Val],
      [f4, '<', field4Val1],
      [f4, '>', field4Val2],
    ];
    const where = new Where({ conditions, query });
    const ans = `
    where 'tableName1'.'f1' = 'tableName2'.'f3'    
      and 'tableName1'.'f2' like ?    
      and 'tableName2'.'f4' < ?
      and 'tableName2'.'f4' > ?    
    `.replace(/'/g, '`');

    expect(removeSpaces(where.toString())).toBe(removeSpaces(ans));
    expect(where.getParams()).toEqual([field2Val, field4Val1, field4Val2]);
  });

  test('not supported operator error', () => {
    const query = new QueryBuilderProto();
    const f = new FieldProto();
    const conditions = [[f, '<=>', '10']];
    expect.assertions(1);
    try {
      // eslint-disable-next-line no-new
      new Where({ conditions, query });
    } catch (e) {
      expect(e).toBeInstanceOf(LogicError);
    }
  });
});
