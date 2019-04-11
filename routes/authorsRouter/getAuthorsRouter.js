const Router = require('koa-router');

const { BadRequestError, NotFoundError } = require('../../helpers/errors');

const router = new Router();

router.get('/by-id/:id', async ctx => {
  const { authorsRepository } = ctx.repository;
  const id = Number(ctx.params.id);
  const res = await authorsRepository.findOne({
    fields: ['id', 'author'],
    conditions: { id },
  });
  if (!res) throw new NotFoundError('Author with such name not found');
  ctx.body = res;
});

router.get('/by-author/:author', async ctx => {
  const { authorsRepository } = ctx.repository;
  const { author } = ctx.params;
  const res = await authorsRepository.findOne({
    fields: ['id', 'author'],
    conditions: { author },
  });
  if (!res) throw new NotFoundError('Author with such name not found');
  ctx.body = res;
});

router.get('/query/:data', async ctx => {
  const { authorsRepository } = ctx.repository;
  let { data } = ctx.params;
  try {
    data = JSON.parse(data);
  } catch (e) {
    throw new BadRequestError(e);
  }
  const res = await authorsRepository.find(data);
  ctx.body = res;
});

module.exports = router;
