const { createDB, createTestApp, encode, dropDBs } = require('./testHeplers');
const { seed } = require('../scripts/seed');
const config = require('../config');
const createApp = require('../app');

afterAll(async () => {
  await dropDBs(config);
});

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
    await seed({ queryFn, options: { authorsFixtures } });
    const urlData = encode({
      fields: ['author'],
      conditions: [{ author: { operator: 'like', value: 'another%' } }],
    });
    await app
      .get(`/authors/query/${urlData}`)
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
    await seed({ queryFn, options: { authorsFixtures } });
    let urlData = encode({
      fields: ['author'],
      order: [{ field: 'author', direction: 'desc' }],
    });
    await app
      .get(`/authors/query/${urlData}`)
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
    await seed({ queryFn, options: { authorsFixtures } });

    const urlData = encode({
      fields: ['author'],
      order: [{ field: 'author', direction: 'asc' }],
      pagination: { limit: 2, offset: 2 },
    });
    await app
      .get(`/authors/query/${urlData}`)
      .expect(200, [{ author: 'cTestName2' }, { author: 'dTestName1' }]);
    await endTest();
  });

  test('wrong additional field in main request', async () => {
    const { db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const urlData = encode({
      fields: ['author'],
      order: [{ field: 'author', direction: 'asc' }],
      pagination: { limit: 2, offset: 2 },
      wrongField: 'test',
    });
    await app.get(`/authors/query/${urlData}`).expect(400);
    await endTest();
  });

  test('wrong additional in order', async () => {
    const { db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const urlData = encode({
      fields: ['author'],
      order: [{ wrongField: 'test', field: 'author', direction: 'asc' }],
    });

    await app.get(`/authors/query/${urlData}`).expect(400);
    await endTest();
  });

  test('wrong type in order', async () => {
    const { db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const urlData = encode({
      fields: ['author'],
      order: [1, { field: 'author', direction: 'asc' }],
    });
    await app.get(`/authors/query/${urlData}`).expect(400);
    await endTest();
  });

  test('wrong direction in order', async () => {
    const { db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const urlData = encode({
      order: [{ field: 'author', direction: 'dasc' }], // dAsc
    });
    await app.get(`/authors/query/${urlData}`).expect(400);
    await endTest();
  });

  test('wrong type in order', async () => {
    const { db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const urlData = encode({
      fields: ['author'],
      order: [1, { field: 'author', direction: 'asc' }],
    });
    await app.get(`/authors/query/${urlData}`).expect(400);
    await endTest();
  });

  test('wrong field in fields list', async () => {
    const { db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const urlData = encode({
      fields: ['author', 'wrong'],
    });
    await app.get(`/authors/query/${urlData}`).expect(400);
    await endTest();
  });

  test('grouping data', async () => {
    const { queryFn, db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const authorsFixtures = [[1, 'author1'], [2, 'author2']];
    const booksFixtures = [
      [1, 'book1'],
      [2, 'book2'],
      [3, 'book3'],
      [4, 'book4'],
    ];

    const bookAuthorsFixtures = [[1, 1], [1, 2], [1, 3], [2, 3], [2, 4]];
    await seed({
      queryFn,
      options: { authorsFixtures, booksFixtures, bookAuthorsFixtures },
    });

    const urlData = encode({
      fields: ['author', 'title'],
      group: ['author'],
    });
    await app.get(`/authors/query/${urlData}`).expect(200, [
      {
        author: 'author1',
        grouping: [{ title: 'book1' }, { title: 'book2' }, { title: 'book3' }],
      },
      { author: 'author2', grouping: [{ title: 'book3' }, { title: 'book4' }] },
    ]);
    await endTest();
  });

  test.only('grouping data with pagination', async () => {
    const { queryFn, db, endTest } = await createDB(config);
    const app = createTestApp({ db, createApp });
    const authorsFixtures = [
      [1, 'author1'],
      [2, 'author2'],
      [3, 'author3'],
      [4, 'author4'],
      [5, 'author5'],
      [6, 'author6'],
      [7, 'author7'],
    ];
    const booksFixtures = [
      [1, 'book1'],
      [2, 'book2'],
      [3, 'book3'],
      [4, 'book4'],
      [5, 'book5'],
      [6, 'book6'],
      [7, 'book7'],
      [8, 'book8'],
      [9, 'book9'],
    ];

    const bookAuthorsFixtures = [
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 3],
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],
    ];
    await seed({
      queryFn,
      options: { authorsFixtures, booksFixtures, bookAuthorsFixtures },
    });

    const urlData = encode({
      fields: ['author', 'title'],
      group: ['author'],
      pagination: { limit: 2, offset: 1 },
      order: [
        { field: 'author', direction: 'asc' },
        { field: 'title', direction: 'desc' },
      ],
    });
    const res = await app.get(`/authors/query/${urlData}`).expect(200);

    expect(res.body).toEqual([
      {
        author: 'author2',
        grouping: [{ title: 'book4' }, { title: 'book3' }],
      },
      { author: 'author3', grouping: [{ title: 'book4' }] },
    ]);

    await endTest();
  });
});
