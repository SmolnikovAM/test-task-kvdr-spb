const Router = require('koa-router');
const authorsRouter = require('./authorsRouter');

const router = new Router();

router.use('/authors', authorsRouter.routes(), authorsRouter.allowedMethods());

module.exports = router;
