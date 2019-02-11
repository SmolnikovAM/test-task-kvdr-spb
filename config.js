const rc = require('rc');
const parseSettings = require('parse-strings-in-object');

const APP_NAME = 'KVDRTEST';

const config = parseSettings(
  rc(APP_NAME, {
    port: 3000,
    env: 'NOT SET',
    timeToDelete: 60 * 60 * 1000,
    staticFolder: './static',
    db: {
      host: 'hostAddressNotSet',
      database: 'databaseNotSet',
      user: 'userNotset',
      password: 'passwordNotSet',
    },
  }),
);

module.exports = config;
