/*
  fields: []
  conditions: {}
  groupBy: []
  sortBy: []
  pagination: []


  example
  {
    fields: ['author', 'count(*)'],
    conditions: { description: 'about book' },
    groupBy: ['author'],
  };
  
  */

module.exports = {
  type: 'object',
  properties: {
    fields: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^(id|title|date|description|image|author|count\\(\\*\\))$',
      },
    },
    conditions: {
      type: 'object',
      //  TO DO check for conditions
      // properties: {
      //  '<'

      //   type: 'object',
      //   items: {
      //     pattern:
      //       '^(id|title|date|description|image|author|count\\(\\*\\)|\\>|\\<|\\%|\\<\\=|\\>\\=)$',
      //   },
      // },
    },
    groupBy: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^(id|title|date|description|image|author)$',
      },
    },
    sortBy: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^(id|title|date|description|image|author|count\\(\\*\\))$',
      },
    },
    pagination: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1 },
        offset: { type: 'integer', minimum: 1 },
      },
    },
  },
};
