const fs = require('fs');
const { promisify } = require('util');
const config = require('../../config');
const booksReport = require('../../repository/booksReport');
const booksRepository = require('../../repository/books');
const authorsRepository = require('../../repository/authors');
const { BadRequestError } = require('../../helpers/errors');

const stat = promisify(fs.stat);

const checkImage = async image => {
  const { type } = (await stat(`${config.staticFolder}/${image}`)) || {};
  return type === 'FILE';
};

function getBooks(options) {
  return booksReport.find(options);
}

async function addAuthor(options) {
  const { name } = options;
  if (!name) {
    throw new BadRequestError('name is required field');
  }
  return authorsRepository.add(options);
}

async function addBook(options) {
  const { title, image } = options;
  if (!title) {
    throw new BadRequestError('title required field');
  }
  if (image && !checkImage(image)) {
    throw new BadRequestError('image not uploaded');
  }

  return booksRepository.add(options);
}

async function deleteBook(id) {
  if (!id) {
    throw new BadRequestError('id required field');
  }
  return booksRepository.erase({ id });
}

async function modifyBook(options) {
  const { id, ...rest } = options;
  const { image } = rest;
  if (!id) {
    throw new BadRequestError('id required field');
  }
  if (image && !checkImage(image)) {
    throw new BadRequestError('image not uploaded');
  }

  return booksRepository.modify(rest, { id });
}

async function modifyAuthor(options) {
  const { id, ...rest } = options;
  if (!id) {
    throw new BadRequestError('id required field');
  }
  return authorsRepository.modify(rest, { id });
}

async function deleteAuthor(id) {
  if (!id) {
    throw new BadRequestError('id required field');
  }
  return authorsRepository.erase({ id });
}

module.exports = {
  deleteAuthor,
  getBooks,
  addBook,
  deleteBook,
  modifyBook,
  addAuthor,
  modifyAuthor,
};
