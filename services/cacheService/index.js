const { timeToDelete } = require('../../config');

class CacheService {
  constructor() {
    this.mem = new Map();
    this.memTimeout = [];
  }

  clear() {
    this.mem.forEach(({ time }) => clearTimeout(time));
    this.mem.clear();
    this.memTimeout.length = 0;
  }

  async get(query) {
    const str = `${query.toString()}${query.params.join(',')}`;
    if (this.mem.has(str)) {
      const data = this.mem.get(str);
      clearTimeout(data.time);
      const time = setTimeout(() => {
        this.mem.delete(str);
      }, timeToDelete);
      data.time = time;
      return data.val;
    }
    const data = { val: await query.send() };
    this.mem.set(str, data);
    const time = setTimeout(() => {
      this.mem.delete(str);
    }, timeToDelete);
    data.time = time;
    return data.val;
  }
}

const cacheService = new CacheService();

module.exports = cacheService;
