const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const authorsRepository = require('../../repository/authorsRepository');

const router = new Router();

router.post('/', bodyParser(), async ctx => {
  const data = ctx.request.body;
  ctx.body = await authorsRepository.append(data);
});

module.exports = router;
