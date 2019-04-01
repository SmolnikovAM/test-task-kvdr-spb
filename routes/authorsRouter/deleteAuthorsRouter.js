const Router = require('koa-router');
const authorRepository = require('../../repository/authorsRepository');

const router = new Router();

router.delete('/:id', async ctx => {
  const id = Number(ctx.params.id);
  ctx.body = await authorRepository.eraseById({ id });
});

module.exports = router;
