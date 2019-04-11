const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Ajv = require('ajv');
const { BadRequestError } = require('../../helpers/errors');

const router = new Router();
const ajv = new Ajv({ allErrors: true });

const modifyAuthorsScheema = {
  type: 'object',
  required: ['author'],
  additionalProperties: false,
  properties: {
    author: { type: 'string' },
  },
};

router.patch('/:id', bodyParser(), async ctx => {
  const { authorsRepository } = ctx.repository;

  const id = Number(ctx.params.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError('id must be a Number');
  }
  if (!ajv.validate(modifyAuthorsScheema, ctx.request.body)) {
    throw new BadRequestError(ajv.errors);
  }
  const data = ctx.request.body;
  ctx.body = await authorsRepository.editById({ id, ...data });
});
module.exports = router;
