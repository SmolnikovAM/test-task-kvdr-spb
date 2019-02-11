const { query } = require('../db');
const QueryBuilder = require('../../helpers/queryBuilder');

async function find(options) {
  const q = new QueryBuilder({ tablesString: 'authors', query });
  return q
    .select(['id', 'name'])
    .andWhere(options)
    .send();
}

async function add(options) {
  const q = new QueryBuilder({ tablesString: 'authors', query });
  return q
    .insert()
    .values(options)
    .send();
}

async function erase(options) {
  const q = new QueryBuilder({ tablesString: 'authors', query });
  return q
    .delete()
    .andWhere(options)
    .send();
}

async function modify(setData, options) {
  const q = new QueryBuilder({ tablesString: 'authors', query });
  return q
    .update()
    .set(setData)
    .andWhere(options)
    .send();
}

module.exports = { find, add, erase, modify };
