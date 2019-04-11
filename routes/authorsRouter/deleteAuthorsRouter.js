const Router = require('koa-router');

const router = new Router();

router.delete('/:id', async ctx => {
  const { authorsRepository } = ctx.repository;
  const id = Number(ctx.params.id);
  ctx.body = await authorsRepository.eraseById({ id });
});

module.exports = router;
