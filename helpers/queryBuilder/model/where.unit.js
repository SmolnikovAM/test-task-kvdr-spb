const Where = require('./where');

const { JoinProto, TableProto, FieldProto } = require('./constants');

const quote = str => `\`${str}\``;

describe('test where statement ', () => {
  const removeSpaces = str => str.toUpperCase().replace(/\s/g, '');

  test('single where clause with one condition. from table', () => {
    const table = new TableProto();
    const tableName = 'test';
    table.getAlias = t => (t === table ? tableName : 'bad');
    const field = new FieldProto();
    const fieldName = 'fieldName';
    field.name = fieldName;
    field.table = table;

    const from = table;
    const conditions = [[field, 'test value']];
    const where = new Where({ conditions, from });
    const ans = `
    where ${quote(tableName)}.${quote(fieldName)} = ?    
    `;

    expect(removeSpaces(where.toString())).toBe(removeSpaces(ans));
    expect(where.getParams()).toEqual(['test value']);
  });

  test('where clause with two conditions. from table', () => {
    const table = new TableProto();
    const tableName = 'test';
    table.getAlias = t => (t === table ? tableName : 'bad');
    const field1 = new FieldProto();
    const field2 = new FieldProto();
    const fieldName1 = 'fieldName';
    const fieldName2 = 'fieldName';
    field1.name = fieldName1;
    field1.table = table;
    field2.name = fieldName2;
    field2.table = table;
    const fieldVal1 = 'test value';
    const fieldVal2 = 54;

    const from = table;
    const conditions = [[field1, fieldVal1], [field2, fieldVal2]];
    const where = new Where({ conditions, from });
    const ans = `
    where ${quote(tableName)}.${quote(fieldName1)} = ?    
      and ${quote(tableName)}.${quote(fieldName2)} = ?    
    `;

    expect(removeSpaces(where.toString())).toBe(removeSpaces(ans));
    expect(where.getParams()).toEqual([fieldVal1, fieldVal2]);
  });

  test('where clause with two conditions. from two tables', () => {
    const table1 = new TableProto();
    const table2 = new TableProto();
    const tableName1 = 'test1';
    const tableName2 = 'test1';
    const join = new JoinProto();

    join.getAlias = t => {
      if (t === table1) return tableName1;
      if (t === table2) return tableName2;
    };

    const fieldName = 'fieldName';
    const f = Array.from({ length: 4 }).map((_, i) => {
      const field = new FieldProto();
      field.name = `${fieldName}${i + 1}`;
      field.table = i % 2 ? table2 : table1;
      return field;
    });
    const [f1, f2, f3, f4] = f;
    const field2Val = 3;
    const field4Val = 'test value';

    const from = join;
    const conditions = [[f1, f3], [f2, field2Val], [f4, field4Val]];
    const where = new Where({ conditions, from });
    const ans = `
    where ${quote(tableName1)}.${quote('fieldName1')} = ${quote(
      tableName2,
    )}.${quote('fieldName3')}    
      and ${quote(tableName1)}.${quote('fieldName2')} = ?    
      and ${quote(tableName2)}.${quote('fieldName4')} = ?    
    `;

    expect(removeSpaces(where.toString())).toBe(removeSpaces(ans));
    expect(where.getParams()).toEqual([field2Val, field4Val]);
  });
});
