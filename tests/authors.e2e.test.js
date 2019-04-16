const { createDB, createTestApp, encode, dropDBs } = require('./testHeplers');
const { seed } = require('../scripts/seed');
const config = require('../config');
const createApp = require('../app');

afterAll(async () => {
  await dropDBs(config);
});

describe('working with authors CRUD routing', () => {
  test('append / double append / read author', async () => {
    const { db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const urlData = encode('testName');
    // no data befor
    await app
      .get(`/authors/by-author/${urlData}`)
      .send('')
      .expect(404);
    // append
    await app
      .post('/authors')
      .send({ author: 'testName' })
      .expect(200);
    // no duplicate data
    await app
      .post('/authors')
      .send({ author: 'testName' })
      .expect(400);
    // get by name
    const {
      body: { author, id },
    } = await app.get(`/authors/by-author/${urlData}`).expect(200);

    expect(author).toBe('testName');
    expect(typeof id).toBe('number');
    // get by id from previous request
    await app.get(`/authors/by-id/${id}`).expect(200, { author, id });
    // end connection
    await endTest();
  });

  test('delete / read author', async () => {
    const { queryFn, db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const authorsFixtures = [['testName0'], ['testName1']];
    seed({ queryFn, options: { authorsFixtures } });
    const urlData = encode('testName1');
    const {
      body: { author, id },
    } = await app
      .get(`/authors/by-author/${urlData}`)
      .send('')
      .expect(200);
    expect(author).toBe('testName1');
    await app
      .delete(`/authors/${id}`)
      .send('')
      .expect(200);
    await app.get(`/authors/by-author/${urlData}`).expect(404);

    await endTest();
  });

  test('modify / read author', async () => {
    const { queryFn, db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const authorsFixtures = [['testName']];
    seed({ queryFn, options: { authorsFixtures } });
    const {
      body: { author, id },
    } = await app
      .get(`/authors/by-author/testName`)
      .send()
      .expect(200);
    expect(author).toBe('testName');
    // modify
    await app
      .patch(`/authors/${id}`)
      .send({ author: 'newTestName' })
      .expect(200);
    // old name not avaliable
    await app
      .get(`/authors/by-author/testName`)
      .send()
      .expect(404);
    // new name avaliable
    await app
      .get(`/authors/by-author/newTestName`)
      .send()
      .expect(200, { author: 'newTestName', id });

    await endTest();
  });
});
