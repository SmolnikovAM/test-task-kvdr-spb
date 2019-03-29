const Router = require('koa-router');
const getAuthorRouter = require('./getAuthorsRouter');
const postAuthorRouter = require('./postAuthorsRouter');
const patchAuthorRouter = require('./patchAuthorsRouter');
const deleteAuthorRouter = require('./deleteAuthorsRouter');

const router = new Router();

[
  getAuthorRouter,
  postAuthorRouter,
  patchAuthorRouter,
  deleteAuthorRouter,
].forEach(r => router.use(r.routes(), r.allowedMethods()));

module.exports = router;
