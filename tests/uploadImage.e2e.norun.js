const supertest = require('supertest');
const http = require('http');
const fs = require('fs');
const config = require('../config');
const { connection } = require('../repository/db');

const createApp = require('../.');

const app = supertest.agent(http.createServer(createApp().callback()));

describe('test', () => {
  afterAll(() => connection.end());

  test('upload image', async done => {
    const imageBinary = fs.readFileSync(`${config.staticFolder}/testImage.jpg`);
    const res = await app.post('/books/image').send(imageBinary);
    expect(res.status).toEqual(200);
    const { image } = res.body;

    const imageCheck = fs.readFileSync(`${config.staticFolder}/${image}`);
    expect(imageBinary).toEqual(imageCheck);
    fs.unlinkSync(`${config.staticFolder}/${image}`);
    done();
  });

  test('static get', async done => {
    const imageBinary = fs.readFileSync(`${config.staticFolder}/testImage.jpg`);
    const res = await app.get('/testImage.jpg');
    expect(res.status).toEqual(200);
    const image = res.body;
    expect(imageBinary).toEqual(image);
    done();
  });
});
