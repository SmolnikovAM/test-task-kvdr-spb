const mysql = require('mysql');
const { ServerError } = require('../helpers/errors');

class Connection {
  constructor(options) {
    this.connection = mysql.createConnection(options);
    this.connection.connect(err => {
      if (err) {
        global.console.error(`error connecting to mysql: ${err.stack}`);
        throw new ServerError('problem with database');
      }
    });
  }

  close() {
    this.connection.end();
  }

  createQueryFn() {
    return this.query.bind(this);
  }

  query(...arg) {
    return new Promise((res, rej) => {
      const callback = (error, results, fields) => {
        if (error) {
          rej(error);
        } else {
          res({ res: results, fields });
        }
      };
      if (arg.length === 1) {
        this.connection.query(arg[0], callback);
      }
      if (arg.length === 2) {
        this.connection.query(...arg, callback);
      }

      if (arg.length > 2) {
        throw new ServerError('too many args');
      }
    });
  }
}

module.exports = Connection;
