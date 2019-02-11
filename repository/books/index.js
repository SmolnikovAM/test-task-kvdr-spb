const { query } = require('../db');
const QueryBuilder = require('../../helpers/queryBuilder');

const tablesString = 'books';
const fieldRules = {
  authorId: `author_id`,
};

async function find(options) {
  const q = new QueryBuilder({
    tablesString,
    query,
    fieldRules: {
      ...fieldRules,
      date: `DATE_FORMAT(date, "%Y-%m-%d")`,
    },
  });
  return q
    .select(['id', 'title', 'authorId', 'image', 'description', 'date'])
    .andWhere(options)
    .send();
}

async function add(options) {
  const q = new QueryBuilder({ tablesString, query, fieldRules });
  return q
    .insert()
    .values(options)
    .send();
}

async function erase(options) {
  const q = new QueryBuilder({ tablesString, query, fieldRules });
  return q
    .delete()
    .andWhere(options)
    .send();
}

async function modify(setData, options) {
  const q = new QueryBuilder({ tablesString, query, fieldRules });
  return q
    .update()
    .set(setData)
    .andWhere(options)
    .send();
}

module.exports = { find, add, erase, modify };
