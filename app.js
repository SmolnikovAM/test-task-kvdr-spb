const Koa = require('koa');
const koaStaticMiddleware = require('koa-static');
const router = require('./routes');
const createRepository = require('./repository');
const config = require('./config');
// const cacheService = require('./services/cacheService');

function createApp(db) {
  const app = new Koa();
  app.context.repository = createRepository(db.createQueryFn());

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(koaStaticMiddleware(config.staticFolder));

  return app;
}

if (!module.parent) {
  createApp().listen(
    config.port,
    () => global.console.log(`Application started on port ${config.port}`),
    global.console.log(`NODE_ENV = ${process.env.NODE_ENV}`),
  );
}

module.exports = createApp;
