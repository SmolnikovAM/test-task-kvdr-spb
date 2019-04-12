const { createDB, createTestApp, encode, dropDBs } = require('./testHeplers');
const { seed } = require('../scripts/seed');
const config = require('../config');
const createApp = require('../app');

afterAll(() => dropDBs(config));

describe('working with authors query routing', () => {
  test('get data with operator like', async () => {
    const { queryFn, db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const authorsFixtures = [
      ['testName0'],
      ['testName1'],
      ['anotherName3'],
      ['anotherName4'],
      ['otherName5'],
    ];
    seed({ queryFn, options: { authorsFixtures } });
    const urlData = encode({
      fields: ['author'],
      conditions: [{ author: { operator: 'like', value: 'another%' } }],
    });

    await app
      .get(`/authors/query/${urlData}`)
      .send('')
      .expect(200, [{ author: 'anotherName3' }, { author: 'anotherName4' }]);

    await endTest();
  });

  test('get data with order', async () => {
    const { queryFn, db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const authorsFixtures = [
      ['cTestName2'],
      ['dTestName1'],
      ['aTestName5'],
      ['eTestName0'],
      ['bTestName4'],
    ];
    seed({ queryFn, options: { authorsFixtures } });

    let urlData = encode({
      fields: ['author'],
      order: [{ field: 'author', direction: 'desc' }],
    });
    await app
      .get(`/authors/query/${urlData}`)
      .send('')
      .expect(200, [
        { author: 'eTestName0' },
        { author: 'dTestName1' },
        { author: 'cTestName2' },
        { author: 'bTestName4' },
        { author: 'aTestName5' },
      ]);

    urlData = encode({
      fields: ['author'],
      order: [{ field: 'author', direction: 'asc' }],
    });

    await app
      .get(`/authors/query/${urlData}`)
      .send('')
      .expect(200, [
        { author: 'aTestName5' },
        { author: 'bTestName4' },
        { author: 'cTestName2' },
        { author: 'dTestName1' },
        { author: 'eTestName0' },
      ]);

    await endTest();
  });

  test('get data with pagination', async () => {
    const { queryFn, db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const authorsFixtures = [
      ['cTestName2'],
      ['dTestName1'],
      ['aTestName5'],
      ['eTestName0'],
      ['bTestName4'],
    ];
    seed({ queryFn, options: { authorsFixtures } });

    const urlData = encode({
      fields: ['author'],
      order: [{ field: 'author', direction: 'asc' }],
      pagination: { limit: 2, offset: 2 },
    });

    await app
      .get(`/authors/query/${urlData}`)
      .send()
      .expect(200, [{ author: 'cTestName2' }, { author: 'dTestName1' }]);

    await endTest();
  });
});
