'use strict';

const makeMiddleware = require('./makeMiddleware');
const Route = require('./Route');

const routes = new WeakMap();

class Router {
  constructor() {
    routes.set(this, []);
  }

  route(path, middlewares, options) {
    routes.get(this).push(new Route(path, middlewares, options));
  }

  get middleware() {
    return makeMiddleware(routes.get(this));
  }
}

module.exports = Router;
