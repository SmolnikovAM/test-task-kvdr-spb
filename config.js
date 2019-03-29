const rc = require('rc');
const parseSettings = require('parse-strings-in-object');

let appName;

switch (process.env.NODE_ENV) {
  case 'production':
    appName = 'kvdr_prod';
    break;
  case 'test':
    appName = 'kvdr_test';
    break;
  case 'development':
    appName = 'kvdr_dev';
    break;
  default:
    appName = 'kvdr_dev';
}

const config = parseSettings(rc(appName));

module.exports = config;
