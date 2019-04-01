const supertest = require('supertest');
const http = require('http');
const seed = require('../scripts/seed');
const booksRepository = require('../repository/books');
const authorsRepository = require('../repository/authors');
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
      booksImage: () => `/testImage.jpg`,
    });
    done();
  });

  afterAll(async done => connection.end(() => done()));

  test('append authors', async done => {
    const res = await app.post('/books/add-author').send({
      name: 'test author append',
    });
    expect(res.status).toEqual(200);
    expect(res.body.insertId).toBe(11);
    done();
  });

  test('append authors with wrong fields', async done => {
    const res = await app.post('/books/add-author').send({
      name: 'test author append',
      wrong: 'sdf',
    });
    expect(res.status).toEqual(400);
    done();
  });

  test('modify authors', async done => {
    const id = 1;
    const name = 'test author append';
    const res = await app.put('/books/modify-author').send({
      id,
      name,
    });
    expect(res.status).toEqual(200);
    const modAuth = await authorsRepository.find({ id });
    expect(modAuth).toEqual([
      {
        id,
        name,
      },
    ]);
    done();
  });

  test('append books', async done => {
    const title = 'new title';
    const date = '2019-01-20';
    const res = await app.post('/books/add-book').send({
      title,
      date,
    });

    expect(res.status).toEqual(200);
    expect(res.body.insertId).toBe(11);
    const newBook = await booksRepository.find({ id: 11 });
    expect(newBook).toEqual([
      {
        id: 11,
        title,
        date,
        description: null,
        authorId: null,
        image: null,
      },
    ]);
    done();
  });

  test('append books with wrong fields', async done => {
    const date = '2019-01-20';
    const res = await app.post('/books/add-book').send({
      date,
    });

    expect(res.status).toEqual(400);
    done();
  });

  test('modify book', async done => {
    const id = 1;
    const descriptionNew = 'description change';
    const res = await app.put('/books/modify-book').send({
      id,
      description: descriptionNew,
    });
    expect(res.status).toEqual(200);
    const [{ description }] = await booksRepository.find({ id });
    expect(description).toBe(descriptionNew);
    done();
  });

  test('delete book', async done => {
    const id = 2;
    const res = await app.delete(`/books/book/${id}`);

    expect(res.status).toEqual(200);

    const data = await booksRepository.find({ id });
    expect(data.length).toBe(0);
    done();
  });

  test('delete author', async done => {
    const id = 2;
    const res = await app.delete(`/books/author/${id}`);

    expect(res.status).toEqual(200);

    const data = await authorsRepository.find({ id });
    expect(data.length).toBe(0);
    done();
  });
});
