const Query = require('../../helpers/queryBuilder');
const { query } = require('../db');

const TABLE_AUTHORS = 'authors';
const TABLE_BOOKS = 'books';

async function find(criteria) {
  const tablesString = `${TABLE_BOOKS} left join ${TABLE_AUTHORS} on ${TABLE_BOOKS}.author_id = ${TABLE_AUTHORS}.id`;

  const fieldRules = {
    date: `DATE_FORMAT(${TABLE_BOOKS}.date, "%Y-%m-%d")`,
    author: `${TABLE_AUTHORS}.name`,
    id: `${TABLE_BOOKS}.id`,
    authorId: `${TABLE_BOOKS}.author_id`,
  };

  const booksQuery = new Query({
    tablesString,
    query,
    fieldRules,
  });
  const { fields, conditions, groupBy, sortBy, pagination } = criteria;

  return booksQuery
    .select(fields)
    .andWhere(conditions)
    .groupBy(groupBy)
    .sortBy(sortBy)
    .pagination(pagination);
}

module.exports = { find };
