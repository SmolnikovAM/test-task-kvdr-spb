const { Table } = require('../../helpers/queryBuilder');

const Repository = require('../repository');

const authorsTable = new Table('authors');

const map = new Map([
  ['id', { alias: 'id', field: 'id', authorsTable }],
  ['author', { alias: 'author', field: 'name', authorsTable }],
]);

module.exports = new Repository({ from: authorsTable, map });
