const Router = require('koa-router');
const Ajv = require('ajv');
const { BadRequestError } = require('../../helpers/errors');
const { SQLCONST } = require('../../helpers/queryBuilder');

const router = new Router();

const ajv = new Ajv({ allErrors: true });

const fieldsPattern = {
  type: 'array',
  items: {
    type: 'string',
    pattern: '^(id|author)$',
  },
};

const conditionPattern = {
  anyOf: [
    {
      type: 'string',
    },
    {
      type: 'object',
      properties: {
        operator: {
          type: 'string',
          pattern: SQLCONST.OPERATORS_PATTERN,
        },
        value: { type: 'string' },
      },
    },
  ],
};

const getAuthorsQuerySchema = {
  type: 'object',
  properties: {
    fields: fieldsPattern,
    group: fieldsPattern,
    conditions: {
      type: 'array',
      items: [
        {
          type: 'object',
          properties: {
            author: conditionPattern,
            id: conditionPattern,
          },
        },
      ],
    },
    order: fieldsPattern,
    pagination: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1 },
        offset: { type: 'integer', minimum: 1 },
      },
    },
  },
};

router.get('/query/:data', async ctx => {
  const { authorsRepository } = ctx.repository;
  let { data } = ctx.params;
  try {
    data = JSON.parse(data);
  } catch (e) {
    throw new BadRequestError(e);
  }
  if (!ajv.validate(getAuthorsQuerySchema, data)) {
    throw new BadRequestError(ajv.errors);
  }
  const res = await authorsRepository.find(data);
  ctx.body = res;
});

module.exports = router;