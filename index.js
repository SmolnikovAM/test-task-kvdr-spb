const config = require('./config');
const createApp = require('./app');

if (!module.parent) {
  createApp().listen(config.port, () => global.console.log('started'));
}

module.exports = createApp;
