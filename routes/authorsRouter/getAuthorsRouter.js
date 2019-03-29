const Router = require('koa-router');

const authorRepository = require('../../repository/authorsRepository');
const { BadRequestError } = require('../../helpers/errors');

const router = new Router();

router.get('/id/:id', async ctx => {
  const { id } = ctx.params;
  ctx.body = await authorRepository.findOne({ conditions: { id } });
});

router.get('/all/:data', async ctx => {
  let { data } = ctx.params;
  try {
    data = JSON.parse(data);
  } catch (e) {
    throw new BadRequestError(e);
  }
  ctx.body = await authorRepository.find(data);
});

module.exports = router;
