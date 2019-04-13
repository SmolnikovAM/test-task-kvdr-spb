const config = require('../config');
const DB = require('../db');
const {
  createTableBookAuthors,
  createTableBooks,
  createTableAuthors,
  dropTableAuthors,
  dropTableBooks,
  dropTableBookAuthors,
  dropDatabaseFn,
  createDatabaseFn,
  grantPrivilegesFn,
  flushPrivileges,
  useDatabaseFn,
} = require('./sqlScripts');

async function createDatabaseAndGivePrivileges({
  queryFn,
  database,
  user,
  host,
}) {
  await queryFn(dropDatabaseFn(database));
  await queryFn(createDatabaseFn(database));
  await queryFn(grantPrivilegesFn({ user, database, host }));
  await queryFn(flushPrivileges);
}

async function createSchema({ queryFn, database }) {
  if (database) {
    await queryFn(useDatabaseFn(database));
  }
  await queryFn(dropTableAuthors);
  await queryFn(dropTableBooks);
  await queryFn(dropTableBookAuthors);
  await queryFn(createTableAuthors);
  await queryFn(createTableBooks);
  await queryFn(createTableBookAuthors);
}

if (!module.parent) {
  (async () => {
    const { database, host, user } = config.db;
    const dbOptions = {
      ...config.db,
      ...config.dbAdminUser,
      database: '',
    };
    const db = new DB(dbOptions);
    const queryFn = db.createQueryFn();
    await createDatabaseAndGivePrivileges({
      queryFn,
      database,
      user,
      host,
    });
    await createSchema({ queryFn, database });
    db.close();
  })();
}

module.exports = {
  createSchema,
  dropDatabaseFn,
  useDatabaseFn,
  createDatabaseAndGivePrivileges,
};
