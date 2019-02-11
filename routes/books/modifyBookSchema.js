module.exports = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    date: { type: 'string' },
    description: { type: 'string' },
    image: { type: 'string' },
    authorId: { type: 'integer' },
  },
  additionalProperties: false,
};
