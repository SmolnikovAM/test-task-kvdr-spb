const dropTableAuthors = 'drop table if exists `authors`';
const createTableAuthors = `create table if not exists 'authors'(
  'id' int not null auto_increment,
  'name' varchar(50),
  primary key('id'),
  unique key('name')  
);`.replace(/'/g, '`'); // for clear reading of script whithout \`tableName\`

const dropTableBooks = 'drop table if exists `books`';
const createTableBooks = `create table if not exists 'books'(
  'id' int not null auto_increment,
  'title' varchar(300),
  'date' date,
  'description' varchar(300),
  'image' varchar(300),
  primary key('id')
);`.replace(/'/g, '`');

const dropTableBookAuthors = 'drop table if exists `book_authors`';
const createTableBookAuthors = `create table if not exists 'book_authors'(
  'book_id' int not null,
  'author_id' int not null,
  foreign key ('book_id') references 'books' ('id'),
  foreign key ('author_id') references 'authors' ('id'),
  primary key ('book_id', 'author_id')
);`.replace(/'/g, '`');

const dropDatabaseFn = database => `drop database if exists \`${database}\`;`;
const createDatabaseFn = database => `create database \`${database}\`;`;
const grantPrivilegesFn = ({ user, database, host }) =>
  `grant insert, select, update, delete on \`${database}\`.* to \`${user}\`@\`${host}\`;`;
const flushPrivileges = `flush privileges;`;
const useDatabaseFn = database => `use \`${database}\`;`;

module.exports = {
  dropTableBookAuthors,
  createTableBookAuthors,
  dropTableAuthors,
  createTableAuthors,
  dropTableBooks,
  createTableBooks,
  dropDatabaseFn,
  createDatabaseFn,
  grantPrivilegesFn,
  flushPrivileges,
  useDatabaseFn,
};
