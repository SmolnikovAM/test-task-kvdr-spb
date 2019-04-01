/* eslint-disable */
const { connection, dbQueryFn } = require('../repository/db');
const { QueryBuilder, Table } = require('../helpers/queryBuilder');

const { createTableAuthors, deleteTableAuthors } = require('./sqlScripts');

const authorsTable = new Table('authors');
const aurhorsFields = [authorsTable.field('id'), authorsTable.field('name')];

async function createScheema() {
  await dbQueryFn(deleteTableAuthors);
  await dbQueryFn(createTableAuthors);
  await new QueryBuilder(dbQueryFn)
    .delete()
    .from(authorsTable)
    .execute();
}

async function seed(options) {
  await createScheema();

  await new QueryBuilder(dbQueryFn)
    .insert(authorsTable)
    .into(aurhorsFields)
    .values([1, 'test1'])
    .values([2, 'test2'])
    .values([3, 'test3'])
    .values([4, 'test4'])
    .values([5, 'testForLikeOperator5'])
    .values([6, 'testForSomething'])
    .execute();
}

/*
const {
  authorsCreateScript,
  authorsDelete,
  booksCreateScript,
  booksDelete,
} = require('./sqlScripts');

const MAX_AUTHORS = 30000;
const MAX_BOOKS = 100000;

async function seed(options) {
  const optionsDefault = {
    maxAuthors: MAX_AUTHORS,
    maxBooks: MAX_BOOKS,
    booksDate: () => '2019-02-10',
    authorsName: i => `Authors name - ${i}`,
    booksTitle: i => `title - ${i}`,
    booksDescription: i => `description - ${i}`,
    booksImage: i => `/image.jpg`,
    logFlag: false,
  };

  optionsDefault.authorId = i =>
    1 + ((2 * i) % (options.maxAuthors || optionsDefault.maxAuthors));

  // custom options will rewrite default options
  const {
    maxAuthors,
    booksDate,
    booksTitle,
    maxBooks,
    authorId,
    authorsName,
    booksDescription,
    booksImage,
    logFlag,
  } = {
    ...optionsDefault,
    ...options,
  };

  const log = (...args) => {
    if (logFlag) global.console.log(...args);
  };

  await query(booksDelete);
  await query(authorsDelete);
  await query(authorsCreateScript);
  log('authors created');

  await query(booksCreateScript);
  log('books created');

  const insertBooks = new QueryBuilder({
    tablesString: 'books',
    query,
  }).insert();
  const insertAuthors = new QueryBuilder({
    tablesString: 'authors',
    query,
  }).insert();

  for (let i = 1; i <= maxAuthors; i += 1) {
    insertAuthors.values({ id: i, name: authorsName(i) });
  }
  await insertAuthors.send();
  log('authors fixtures');

  for (let i = 1; i <= maxBooks; i += 1) {
    insertBooks.values({
      id: i,
      title: booksTitle(i),
      date: booksDate(i),
      author_id: authorId(i),
      description: booksDescription(i),
      image: booksImage(i),
    });
  }

  await insertBooks.send();
}

*/

if (!module.parent) {
  seed({ logFlag: true }).then(() => connection.end());
}

module.exports = seed;
