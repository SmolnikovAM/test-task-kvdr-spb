const Koa = require('koa');
const Router = require('koa-router');
const koaStaticMiddleware = require('koa-static');
const config = require('./config');
const authorsRouter = require('./routes/authorsRouter');
// const bookRouter = require('./routes/books');
// const cacheService = require('./services/cacheService');

function createApp() {
  const app = new Koa();
  const mainRouter = new Router();

  mainRouter.get('/test', ctx => {
    ctx.body = { message: 'test ok' };
  });

  mainRouter.use(
    '/authors',
    authorsRouter.routes(),
    authorsRouter.allowedMethods(),
  );

  // app.use(async (ctx, next) => {
  //   await next();
  //   if (
  //     ctx.status === 200 &&
  //     ['POST', 'DELETE', 'UPDATE', 'PUT'].indexOf(ctx.req.method) !== -1
  //   ) {
  //     cacheService.clear();
  //   }
  // });

  // mainRouter.use('/books', bookRouter.routes(), bookRouter.allowedMethods());

  app.use(mainRouter.allowedMethods());
  app.use(mainRouter.routes());
  app.use(koaStaticMiddleware(config.staticFolder));

  return app;
}

module.exports = createApp;
