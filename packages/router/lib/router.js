import makeMiddleware from './make-middleware.js';
import Route from './route.js';

const routes = new WeakMap();

export default class Router {
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
