const authorsCreateScript = `
create table if not exists authors(
  id int not null auto_increment,
  name varchar(300),
  primary key (id)
)`;
const authorsDelete = 'drop table if exists authors';

const booksCreateScript = `
create table if not exists books(
  id int not null auto_increment,
  title varchar(300),
  date date,
  author_id int,
  description varchar(300),
  image varchar(300),
  foreign key (author_id) references authors(id),
  primary key(id)
  )`;
const booksDelete = 'drop table if exists books';

/*
const newVar = `
create table books(
  id int not null auto_increment,
  title varchar(10),
  primary key(id)
);

create table `authors`(
  id int not null auto_increment,
  name varchar(10),
  primary key(id)
);

create table `book_authors`(
  book_id int not null,
  author_id int not null,
  foreign key (book_id) references `books` (id),
  foreign key (author_id) references `authors` (id),
  primary key (book_id, author_id)
);

insert into `books` (id, title) values (1, 'test 1');
insert into `books` (id, title) values (2, 'test 2');
insert into `books` (id, title) values (3, 'test 3');

insert into `authors` (id, name) values (1, 'test 1 1');
insert into `authors` (id, name) values (2, 'test 2 2');
insert into `authors` (id, name) values (3, 'test 2 3');

insert into `book_authors`(book_id, author_id) values (1, 1);
insert into `book_authors`(book_id, author_id) values (2, 2);
insert into `book_authors`(book_id, author_id) values (2, 3);


`;
*/

module.exports = {
  authorsCreateScript,
  authorsDelete,
  booksCreateScript,
  booksDelete,
};
