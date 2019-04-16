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
    pattern: '^(id|author|title)$',
  },
};

const conditionPattern = {
  anyOf: [
    { type: 'string' },
    {
      type: 'object',
      additionalProperties: false,
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

const oderByPattern = {
  anyOf: [
    { type: 'string' },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        field: { type: 'string' },
        direction: { type: 'string', pattern: '^(asc|desc)$' },
      },
    },
  ],
};

const getAuthorsQuerySchema = {
  type: 'object',
  additionalProperties: false,
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
            title: conditionPattern,
          },
        },
      ],
    },
    order: {
      type: 'array',
      items: [oderByPattern],
    },
    pagination: {
      type: 'object',
      additionalProperties: false,
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
