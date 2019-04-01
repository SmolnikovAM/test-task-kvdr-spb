const { Table } = require('../../helpers/queryBuilder');

const Repository = require('../repository');

const table = new Table('authors');

const map = new Map([
  ['id', { alias: 'id', field: 'id', table }],
  ['author', { alias: 'author', field: 'name', table }],
]);

module.exports = new Repository({ from: table, map });
