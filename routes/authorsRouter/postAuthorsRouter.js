const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Ajv = require('ajv');
const { BadRequestError } = require('../../helpers/errors');
const BookAuthorsService = require('../../services/BookAuthorsSevice');

const router = new Router();

const ajv = new Ajv({ allErrors: true });

const appendAuthorsScheema = {
  type: 'object',
  required: ['author'],
  additionalProperties: false,
  properties: {
    author: { type: 'string' },
    books: {
      type: 'array',
      items: [{ type: 'integer' }],
    },
  },
};

router.post('/', bodyParser(), async ctx => {
  if (!ajv.validate(appendAuthorsScheema, ctx.request.body)) {
    throw new BadRequestError(ajv.errors);
  }
  const { repository } = ctx;
  const bookAuthorsService = new BookAuthorsService({ repository });
  ctx.body = await bookAuthorsService.addAuthor(ctx.request.body);
});

module.exports = router;
