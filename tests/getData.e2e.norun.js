const supertest = require('supertest');
const http = require('http');
const seed = require('../scripts/seed');
const { connection } = require('../repository/db');

const createApp = require('../.');

const app = supertest.agent(http.createServer(createApp().callback()));

describe('test', () => {
  beforeAll(async done => {
    await seed({
      maxAuthors: 10,
      maxBooks: 10,
      authorId: i => i,
      authorsName: i => `name${i}`,
      booksTitle: i => `title${i}`,
      booksDate: i => `2019-02-${10 + (i < 5 ? 0 : 1)}`,
      booksDescription: i => `description${i}`,
      booksImage: i => `/image${i}.jpg`,
    });
    done();
  });

  afterAll(async done => connection.end(() => done()));

  test('App works', async () => {
    const res = await app.get('/test');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ message: 'test ok' });
  });

  test('select one row', async done => {
    const jsonData = encodeURI(
      JSON.stringify({
        fields: ['title', 'date', 'author', 'description', 'image'],
        conditions: { id: 1 },
      }),
    );

    const res = await app.get(`/books/query/${jsonData}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        title: 'title1',
        date: '2019-02-10',
        author: 'name1',
        description: 'description1',
        image: '/image1.jpg',
      },
    ]);
    done();
  });

  test('select with id < 3', async done => {
    const jsonData = encodeURI(
      JSON.stringify({
        fields: ['title', 'date', 'author', 'description', 'image'],
        sortBy: ['id'],
        conditions: { '<': { id: 3 } },
      }),
    );

    const res = await app.get(`/books/query/${jsonData}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        title: 'title1',
        date: '2019-02-10',
        author: 'name1',
        description: 'description1',
        image: '/image1.jpg',
      },
      {
        title: 'title2',
        date: '2019-02-10',
        author: 'name2',
        description: 'description2',
        image: '/image2.jpg',
      },
    ]);
    done();
  });

  test('select with invalid field', async done => {
    const jsonData = encodeURI(
      JSON.stringify({
        fields: ['title', 'date2'],
        sortBy: ['id'],
      }),
    );

    const res = await app.get(`/books/query/${jsonData}`);
    expect(res.status).toBe(400);
    done();
  });

  test('select with group by and count', async done => {
    const jsonData = encodeURI(
      JSON.stringify({
        fields: ['date', 'count(*)'],
        groupBy: ['date'],
      }),
    );
    // %7B%22fields%22:%5B%22date%22,%22count(*)%22%5D,%22groupBy%22:%5B%22date%22%5D%7D

    const res = await app.get(`/books/query/${jsonData}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        date: '2019-02-10',
        cnt: 4,
      },
      {
        date: '2019-02-11',
        cnt: 6,
      },
    ]);
    done();
  });

  test('select pagination with sort', async done => {
    const jsonData = encodeURI(
      JSON.stringify({
        fields: ['id', 'title', 'date', 'author', 'description', 'image'],
        sortBy: ['id'],
        pagination: { offset: 3, limit: 2 },
      }),
    );

    const res = await app.get(`/books/query/${jsonData}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 4,
        title: 'title4',
        date: '2019-02-10',
        author: 'name4',
        description: 'description4',
        image: '/image4.jpg',
      },
      {
        id: 5,
        title: 'title5',
        date: '2019-02-11',
        author: 'name5',
        description: 'description5',
        image: '/image5.jpg',
      },
    ]);
    done();
  });

  test('select with bad pagination ', async done => {
    const jsonData = encodeURI(
      JSON.stringify({
        fields: ['id', 'title', 'date', 'author', 'description', 'image'],
        sortBy: ['id'],
        pagination: { offset: -1, limit: 'dfd' },
      }),
    );

    const res = await app.get(`/books/query/${jsonData}`);
    expect(res.status).toBe(400);
    done();
  });
});
