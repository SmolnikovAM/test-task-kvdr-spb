const supertest = require('supertest');
const http = require('http');
const seed = require('../scripts/seed');

const createApp = require('../.');

const app = supertest.agent(http.createServer(createApp().callback()));

describe('working with aurhors route', () => {
  test('get authors', () => {
    // const a = {
    //   conditions: { id: { operator: '>', value: '2' } },
    //   pagination: { limit: 3, offset: 2 },
    // };
    // encodeURI(JSON.stringify(a))
    // '%7B%22conditions%22:%7B%22id%22:%7B%22operator%22:%22%3E%22,%22value%22:%222%22%7D%7D,%22pagination%22:%7B%22limit%22:3,%22offset%22:2%7D%7D'
    // http get localhost:3000/authors/query/%7B%22conditions%22:%7B%22id%22:%7B%22operator%22:%22%3E%22,%22value%22:%222%22%7D%7D,%22pagination%22:%7B%22limit%22:3,%22offset%22:2%7D%7D
  });

  test('update authors', () => {});

  test('get authors', () => {});
});
