const Router = require('koa-router');
const Ajv = require('ajv');
const uuid = require('uuid/v4');
const fs = require('fs');
const bodyParser = require('koa-bodyparser');
const config = require('../../config');
const booksService = require('../../services/booksService');
const { BadRequestError } = require('../../helpers/errors');
const cacheService = require('../../services/cacheService');

const getReportSchema = require('./getReportSchema');
const addBookSchema = require('./addBookSchema');
const modifyBookSchema = require('./modifyBookSchema');
const addAuthorSchema = require('./addAuthorSchema');
const modifyAuthorSchema = require('./modifyAuthorSchema');

const router = new Router();

const ajv = new Ajv({ allErrors: true });

router.get('/query/:jsonParam', async ctx => {
  let options;
  try {
    options = JSON.parse(ctx.params.jsonParam);
  } catch (errors) {
    throw new BadRequestError(errors);
  }

  if (!ajv.validate(getReportSchema, options)) {
    throw new BadRequestError(ajv.errors);
  }
  const query = await booksService.getBooks(options);
  const data = await cacheService.get(query);

  ctx.body = data;
});

router.post('/add-book', bodyParser(), async ctx => {
  if (!ajv.validate(addBookSchema, ctx.request.body)) {
    throw new BadRequestError(ajv.errors);
  }
  const { insertId } = await booksService.addBook(ctx.request.body);
  ctx.body = { insertId };
});

router.post('/add-author', bodyParser(), async ctx => {
  if (!ajv.validate(addAuthorSchema, ctx.request.body)) {
    throw new BadRequestError(ajv.errors);
  }
  const { insertId } = await booksService.addAuthor(ctx.request.body);
  ctx.body = { insertId };
});

router.put('/modify-author', bodyParser(), async ctx => {
  if (!ajv.validate(modifyAuthorSchema, ctx.request.body)) {
    throw new BadRequestError(ajv.errors);
  }
  const data = await booksService.modifyAuthor(ctx.request.body);
  ctx.body = data;
});

router.put('/modify-book', bodyParser(), async ctx => {
  if (!ajv.validate(modifyBookSchema, ctx.request.body)) {
    throw new BadRequestError(ajv.errors);
  }
  const data = await booksService.modifyBook(ctx.request.body);
  ctx.body = data;
});

router.delete('/author/:id', async ctx => {
  const id = Number(ctx.params.id);
  if (!Number.isInteger(id)) {
    throw new BadRequestError('bad parameter');
  }
  const data = await booksService.deleteAuthor(id);
  ctx.body = data;
});

router.delete('/book/:id', async ctx => {
  const id = Number(ctx.params.id);
  if (!Number.isInteger(id)) {
    throw new BadRequestError('bad parameter');
  }
  const data = await booksService.deleteBook(id);
  ctx.body = data;
});

router.post('/image', async ctx => {
  if (Number(ctx.request.headers['Content-length']) > 4 * 1024 * 1024) {
    throw new BadRequestError('to big file');
  }
  const image = `${uuid()}.jpg`;
  const path = `${config.staticFolder}/${image}`;
  const file = fs.createWriteStream(path);
  let ok;
  const p = new Promise(r => {
    ok = r;
  });
  ctx.req.on('end', ok);
  ctx.req.pipe(file);
  await p;
  ctx.body = { image };
});

module.exports = router;
