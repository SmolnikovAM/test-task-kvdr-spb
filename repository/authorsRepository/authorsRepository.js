const Repository = require('../repositoryClass');
const { Table } = require('../../helpers/queryBuilder');

const table = new Table('authors');

const map = new Map([
  ['id', { alias: 'id', field: 'id', table }],
  ['author', { alias: 'author', field: 'name', table }],
]);

class AuthorsRepository extends Repository {
  constructor(queryFn) {
    super({ queryFn, table, map });
  }
}

module.exports = AuthorsRepository;
