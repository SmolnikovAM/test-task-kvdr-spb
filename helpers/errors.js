const MYSQL_ERRORS = {
  ER_DUP_ENTRY: 'ER_DUP_ENTRY',
};

function convert(message) {
  let textMsg = '';
  if (typeof message === 'object') {
    try {
      textMsg += JSON.stringify(message);
    } catch (e) {
      textMsg += 'recursive link in message';
    }
  } else {
    textMsg += message;
  }
  return textMsg;
}

class NotFoundError extends Error {
  constructor(message) {
    const textMsg = `Error: Not Found\n${convert(message)}`;
    super(textMsg);
    this.status = 404;
    this.expose = true;
  }
}

class ServerError extends Error {
  constructor(message) {
    const textMsg = `Error: Not Found\n${convert(message)}`;
    super(textMsg);
    this.status = 500;
    this.expose = true;
  }
}

class LogicError extends Error {
  constructor(message) {
    const textMsg = `Error: LogicError\n${convert(message)}`;
    super(textMsg);
    this.status = 400;
    this.expose = true;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    const textMsg = `Error: BadRequestError\n${convert(message)}`;
    super(textMsg);
    this.status = 400;
    this.expose = true;
  }
}

module.exports = {
  MYSQL_ERRORS,
  NotFoundError,
  BadRequestError,
  LogicError,
  ServerError,
};
