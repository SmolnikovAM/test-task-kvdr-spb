const Router = require('koa-router');
const getAuthorsByFieldRouter = require('./getAuthorsByFieldRouter');
const getAuthorsQueryRouter = require('./getAuthorsQueryRouter');
const postAuthorsRouter = require('./postAuthorsRouter');
const patchAuthorsRouter = require('./patchAuthorsRouter');
const deleteAuthorsRouter = require('./deleteAuthorsRouter');

const router = new Router();
[
  getAuthorsByFieldRouter,
  getAuthorsQueryRouter,
  postAuthorsRouter,
  patchAuthorsRouter,
  deleteAuthorsRouter,
].forEach(r => router.use(r.routes(), r.allowedMethods()));

module.exports = router;
