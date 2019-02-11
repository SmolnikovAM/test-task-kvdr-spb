module.exports = {
  type: 'object',
  required: ['id','name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    id: { type: 'integer' }
  },
};
