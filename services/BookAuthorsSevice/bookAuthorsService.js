class BookAuthorsService {
  constructor({ repository }) {
    Object.assign(this, repository);
  }

  async addAuthor(data) {
    const { books, ...rest } = data;
    const res = await this.authorsRepository.append(rest);
    return res;
  }

  deleteAuthor() {}

  editAuthor() {}

  readAuthor() {}

  addBook() {}

  deleteBook() {}

  editBook() {}

  readBook() {}
}

module.exports = BookAuthorsService;
