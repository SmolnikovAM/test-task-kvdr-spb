const { Table } = require('../../helpers/queryBuilder');

const Repository = require('../repository');

const table = new Table('authors');

const map = new Map([
  ['id', { alias: 'id', field: 'id' }],
  ['author', { alias: 'author', field: 'name' }],
]);

module.exports = new Repository({ table, map });
