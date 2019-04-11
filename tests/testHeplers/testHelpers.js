const DB = require('../../db');
const { createSchema } = require('../../scripts/createSchema');
const { ServerError } = require('../../helpers/errors');

let cnt = 0;

async function createDB(config) {
  cnt += 1;
  const { user, password } = config.dbAdminUser;
  const db = new DB({ ...config.db, user, password });
  const queryFn = db.createQueryFn();
  const dbName = `test${cnt}`;
  await queryFn(`drop database if exists ${dbName};`);
  await queryFn(`create database ${dbName};`);
  await queryFn(`use ${dbName};`);
  await createSchema(queryFn);
  await queryFn(
    `grant insert, select, update, delete on ${dbName}.* to '${
      config.db.user
    }'@'${config.db.host}';`,
  );
  await queryFn(`flush privileges;`);

  db.connection.changeUser(
    { user: config.db.user, password: config.db.password, database: dbName },
    err => {
      if (err) throw new ServerError(err);
    },
  );

  const endTest = async () => {
    db.connection.changeUser(
      { user: config.dbAdminUser.user, password: config.dbAdminUser.password },
      err => {
        if (err) throw new ServerError(err);
      },
    );
    await queryFn(`drop database ${dbName};`);
    await db.close();
  };

  return { queryFn, db, endTest };
}

module.exports = { createDB };
