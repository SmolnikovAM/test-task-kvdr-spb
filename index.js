const Koa = require('koa');
const Router = require('koa-router');
const koaStaticMiddleware = require('koa-static');
const config = require('./config');
const bookRouter = require('./routes/books');
const cacheService = require('./services/cacheService');

function createApp() {
  const app = new Koa();
  const mainRouter = new Router();

  mainRouter.get('/test', ctx => {
    ctx.body = { message: 'test ok' };
  });

  app.use(async (ctx, next) => {
    await next();
    if (
      ctx.status === 200 &&
      ['POST', 'DELETE', 'UPDATE', 'PUT'].indexOf(ctx.req.method) !== -1
    ) {
      cacheService.clear();
    }
  });

  mainRouter.use('/books', bookRouter.routes(), bookRouter.allowedMethods());

  app.use(mainRouter.allowedMethods());
  app.use(mainRouter.routes());
  app.use(koaStaticMiddleware(config.staticFolder));

  return app;
}

if (['PROD', 'DEV', 'TEST', 'SEED'].indexOf(config.env) === -1) {
  throw new Error('Bad config');
}

if (['PROD', 'DEV'].indexOf(config.env) !== -1) {
  createApp().listen(config.port, () => console.log('started'));
}

module.exports = createApp;
