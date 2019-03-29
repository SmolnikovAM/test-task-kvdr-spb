const Router = require('koa-router');

const router = new Router();

router.patch('/', async ctx => {
  ctx.body = { patch: 'ok' };
});
module.exports = router;
