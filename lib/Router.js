'use strict';

const Stacks = require('./Stacks');
const makeMiddleware = require('./makeMiddleware');

class Router {
  constructor(opts) {
    this.options = opts || {};
    this.stacks = new Stacks();
  }

  add(method, path) {
    const middlewares = Array.prototype.slice.call(arguments, 2);

    this.stacks.add(method, path, this.options, middlewares);

    return this;
  }

  get middleware() {
    return makeMiddleware(this);
  }
}

module.exports = Router;
