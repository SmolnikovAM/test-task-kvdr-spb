const config = require('../config');
const DB = require('../db');
const { createTableAuthors } = require('./sqlScripts');

async function createSchema(queryFn) {
  await queryFn(createTableAuthors);
}

if (!module.parent) {
  (async () => {
    const db = new DB(config.db);
    await createSchema(db.createQueryFn());
  })();
}

module.exports = { createSchema };
