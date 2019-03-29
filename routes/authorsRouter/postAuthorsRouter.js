const Router = require('koa-router');

const router = new Router();

router.post('/', async ctx => {
  ctx.body = { post: 'ok' };
});

module.exports = router;
