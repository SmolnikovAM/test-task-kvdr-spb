module.exports = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    date: { type: 'string' },
    description: { type: 'string' },
    image: { type: 'string' },
    authorId: { type: 'integer' },
  },
  additionalProperties: false,
};
