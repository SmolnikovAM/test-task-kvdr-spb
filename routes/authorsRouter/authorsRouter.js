const Router = require('koa-router');
const getAuthorsRouter = require('./getAuthorsRouter');
const postAuthorsRouter = require('./postAuthorsRouter');
const patchAuthorsRouter = require('./patchAuthorsRouter');
const deleteAuthorsRouter = require('./deleteAuthorsRouter');

const router = new Router();

[
  getAuthorsRouter,
  postAuthorsRouter,
  patchAuthorsRouter,
  deleteAuthorsRouter,
].forEach(r => router.use(r.routes(), r.allowedMethods()));

module.exports = router;
