const Router = require('koa-router');

const router = new Router();

router.delete('/', async ctx => {
  ctx.body = { delete: 'ok' };
});

module.exports = router;
