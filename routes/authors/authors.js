const Router = require('koa-router');
const getAuthor = require('./getAuthor');
const postAuthor = require('./postAuthor');
const patchAuthor = require('./patchAuthor');
const deleteAuthor = require('./deleteAuthor');

const router = new Router();

[getAuthor, postAuthor, patchAuthor, deleteAuthor].forEach(r =>
  router.use(r.routes(), r.allowedMethods()),
);

module.exports = router;
