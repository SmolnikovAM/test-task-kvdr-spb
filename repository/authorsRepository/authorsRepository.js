const Repository = require('../repositoryClass');
const { Table } = require('../../helpers/queryBuilder');

const authorsTable = new Table('authors');

const map = new Map([
  ['id', { alias: 'id', field: 'id', authorsTable }],
  ['author', { alias: 'author', field: 'name', authorsTable }],
]);

class AuthorsRepository extends Repository {
  constructor(queryFn) {
    super({ queryFn, from: authorsTable, map });
  }
}

module.exports = AuthorsRepository;
