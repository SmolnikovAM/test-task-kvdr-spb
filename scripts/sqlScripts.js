const dropTableAuthors = 'drop table if exists `authors`';
const createTableAuthors = `
create table if not exists 'authors'(
  'id' int not null auto_increment,
  'name' varchar(50),
  primary key('id'),
  unique key('name')  
);`.replace(/'/g, '`'); // for clear reading of script whithout \`tableName\`

const dropTableBooks = 'drop table if exists `books`';
const сreateTableBooks = `
create table if not exists 'books'(
  'id' int not null auto_increment,
  'title' varchar(300),
  'date' date,
  'description' varchar(300),
  'image' varchar(300),
  primary key('id')
);`.replace(/'/g, '`');

const dropTableBooksAuthors = 'drop table if exists `book_authors`';
const createTableBooksAuthors = `
create table 'book_authors'(
  'book_id' int not null,
  'author_id' int not null,
  foreign key ('book_id') references 'books' ('id'),
  foreign key ('author_id') references 'authors' ('id'),
  primary key ('book_id', 'author_id')
);`.replace(/'/g, '`');

module.exports = {
  dropTableBooksAuthors,
  createTableBooksAuthors,
  dropTableAuthors,
  createTableAuthors,
  dropTableBooks,
  сreateTableBooks,
};
