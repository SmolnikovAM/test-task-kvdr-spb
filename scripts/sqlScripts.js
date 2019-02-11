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

module.exports = {
  authorsCreateScript,
  authorsDelete,
  booksCreateScript,
  booksDelete,
};
