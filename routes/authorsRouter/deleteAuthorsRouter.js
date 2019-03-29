const Router = require('koa-router');

// const { BadRequestError, LogicError } = require('../../helpers/errors');

const router = new Router();

router.delete('/:id', async ctx => {
  ctx.body = { delete: 'ok' };
});

module.exports = router;
