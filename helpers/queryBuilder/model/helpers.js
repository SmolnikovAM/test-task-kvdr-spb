const quote = str => `\`${str}\``;

const checkNumber = num => Number.isInteger(num) && num > 0;

module.exports = { quote, checkNumber };
