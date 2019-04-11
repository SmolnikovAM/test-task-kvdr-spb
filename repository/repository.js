const AuthorsRepository = require('./authorsRepository');

function createRepository(queryFn) {
  const authorsRepository = new AuthorsRepository(queryFn);

  return { authorsRepository, queryFn };
}

module.exports = createRepository;
