const Field = require('./field');
const { STAR, TABLE_FIELD, STAR_FIELD, TableProto } = require('./constants');

class Table extends TableProto {
  constructor(name) {
    super();
    this.name = name;
  }
}

const { ServerError } = require('../../errors');

describe('test QueryBuilder field', () => {
  test('new field', () => {
    const table = new Table('test');
    const name = 'name';
    const field = new Field({ table, name });

    expect(field).toEqual({ table, name, alias: name, type: TABLE_FIELD });
  });

  test('new field with alias', () => {
    const table = new Table('test');
    const name = 'name';
    const alias = 'alias';
    const field = new Field({ table, name, alias });

    expect(field).toEqual({ table, name, alias, type: TABLE_FIELD });
  });

  test('new field with alias', () => {
    const field = new Field(STAR);

    expect(field).toEqual({ alias: null, type: STAR_FIELD });
  });

  test('new field table error', () => {
    expect.assertions(1);
    const table = { name: 'test' };
    const name = 'name';
    try {
      // eslint-disable-next-line
      new Field({ table, name });
    } catch (e) {
      expect(e instanceof ServerError).toBe(true);
    }
  });

  test('new field naming error', () => {
    expect.assertions(1);
    const table = { name: 'test' };
    const name = '';
    try {
      // eslint-disable-next-line
      new Field({ table, name });
    } catch (e) {
      expect(e instanceof ServerError).toBe(true);
    }
  });

  test('new field empty error', () => {
    expect.assertions(1);
    try {
      // eslint-disable-next-line
      new Field();
    } catch (e) {
      expect(e instanceof ServerError).toBe(true);
    }
  });
});
