const http = require('http');
const supertest = require('supertest');
const uuid = require('uuid/v4');
const DB = require('../../db');

const {
  createSchema,
  dropDatabaseFn,
  createDatabaseAndGivePrivileges,
} = require('../../scripts/createSchema');
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
    const db = new DB({ ...config.db, database: '', user, password });
    const queryFn = db.createQueryFn();
    const d = [...databasesToDrop];
    for (let i = 0; i < d.length; i += 1) {
      // eslint-disable-next-line
      await queryFn(dropDatabaseFn(d[i]));
    }
    await db.close();
  }
}

async function createDB(config) {
  const unique = uuid().replace(/-/g, '');
  const { user, host, database: configDbName, password } = config.db;
  const db = new DB({
    ...config.db,
    database: '',
    user: config.dbAdminUser.user,
    password: config.dbAdminUser.password,
  });
  const queryFn = db.createQueryFn();
  const database = `${configDbName || 'test'}_${unique}`;
  await createDatabaseAndGivePrivileges({ queryFn, database, user, host });
  await createSchema({ queryFn, database });
  databasesToDrop.add(database);

  db.connection.changeUser({ user, password, database }, err => {
    if (err) throw new ServerError(err);
  });

  const endTest = async () => {
    await db.close();
  };

  return { queryFn, db, endTest };
}

module.exports = { createDB, createTestApp, encode, dropDBs };
