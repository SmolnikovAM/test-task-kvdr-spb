const Repository = require('../repositoryClass');
const { Table } = require('../../helpers/queryBuilder');

const tableAuthors = new Table('authors');
const tableBooks = new Table('books');
const tableBookAuthors = new Table('book_authors');

const map = new Map([
  ['id', { alias: 'id', field: 'id', table: tableAuthors }],
  ['author', { alias: 'author', field: 'name', table: tableAuthors }],
  ['title', { alias: 'title', field: 'title', table: tableBooks }],
  ['bookId', { alias: 'bookId', field: 'id', table: tableBooks }],
]);

const from = tableAuthors
  .leftJoin(tableBookAuthors)
  .on([tableAuthors.field('id'), tableBookAuthors.field('author_id')])
  .leftJoin(tableBooks)
  .on([tableBookAuthors.field('book_id'), tableBooks.field('id')]);

class AuthorsRepository extends Repository {
  constructor(queryFn) {
    super({ queryFn, table: tableAuthors, from, map });
  }
}

module.exports = AuthorsRepository;
