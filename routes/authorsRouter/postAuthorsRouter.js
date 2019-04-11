const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Ajv = require('ajv');
const { BadRequestError } = require('../../helpers/errors');

const router = new Router();

const ajv = new Ajv({ allErrors: true });

const appendAuthorsScheema = {
  type: 'object',
  required: ['author'],
  additionalProperties: false,
  properties: {
    author: { type: 'string' },
  },
};

router.post('/', bodyParser(), async ctx => {
  const { authorsRepository } = ctx.repository;
  if (!ajv.validate(appendAuthorsScheema, ctx.request.body)) {
    throw new BadRequestError(ajv.errors);
  }
  const data = ctx.request.body;
  ctx.body = await authorsRepository.append(data);
});

module.exports = router;
