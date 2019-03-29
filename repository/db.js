const mysql = require('mysql');
const config = require('../config');
const { ServerError } = require('../helpers/errors');

const connection = mysql.createConnection(config.db);

connection.connect();

const dbQueryFn = (...arg) =>
  new Promise((res, rej) => {
    const callback = (error, results, fields) => {
      if (error) {
        rej(error);
      } else {
        res({ res: results, fields });
      }
    };
    if (arg.length === 1) {
      connection.query(arg[0], callback);
    }
    if (arg.length === 2) {
      connection.query(...arg, callback);
    }

    if (arg.length > 2) {
      throw new ServerError('too many args');
    }
  });

module.exports = { connection, dbQueryFn };
