const http = require('http');
const supertest = require('supertest');
const uuid = require('uuid/v4');
const DB = require('../../db');

const { createSchema } = require('../../scripts/createSchema');
const { ServerError } = require('../../helpers/errors');

const databasesToDrop = new Set();

function createTestApp({ db, createApp }) {
  return supertest.agent(http.createServer(createApp(db).callback()));
}

function encode(data) {
  return typeof data === 'object'
    ? encodeURI(JSON.stringify(data))
    : encodeURI(data);
}

async function dropDBs(config) {
  if (databasesToDrop.size > 0) {
    const { user, password } = config.dbAdminUser;
    const db = new DB({ ...config.db, user, password });
    const queryFn = db.createQueryFn();
    const d = [...databasesToDrop];
    for (let i = 0; i < d.length; i += 1) {
      // eslint-disable-next-line
      await queryFn(`drop database \`${d[i]}\`;`);
    }
    db.close();
  }
}

async function createDB(config) {
  const unique = uuid().replace(/-/g, '');
  const { user, password } = config.dbAdminUser;
  const db = new DB({ ...config.db, user, password });
  const queryFn = db.createQueryFn();
  const dbName = `test_${unique}`;
  await queryFn(`drop database if exists \`${dbName}\`;`);
  await queryFn(`create database \`${dbName}\`;`);
  await queryFn(`use \`${dbName}\`;`);
  await createSchema(queryFn);
  await queryFn(
    `grant insert, select, update, delete on \`${dbName}\`.* to '${
      config.db.user
    }'@'${config.db.host}';`,
  );
  await queryFn(`flush privileges;`);
  databasesToDrop.add(dbName);

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
    await queryFn(`drop database \`${dbName}\`;`);
    databasesToDrop.delete(dbName);
    await db.close();
  };

  return { queryFn, db, endTest };
}

module.exports = { createDB, createTestApp, encode, dropDBs };
