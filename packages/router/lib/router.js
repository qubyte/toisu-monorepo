import runner from '@toisu/middleware-runner';
import { pathToRegexp } from 'path-to-regexp';
import makeParams from './make-params.js';
import normalizeHandlers from './normalize-handlers.js';

function makeRoute(path, preNormalizedHandlers, options) {
  const handlers = normalizeHandlers(preNormalizedHandlers);
  const allowedMethods = Object.keys(handlers);
  const allow = allowedMethods.sort().join(', ');
  const keys = [];
  const regex = pathToRegexp(path, keys, options);

  function notAllowed(_req, res) {
    res.writeHead(405, { allow }).end();
  }

  return function match(req) {
    const { pathname } = new URL(req.url, 'http://none');
    const paramList = regex.exec(pathname);

    if (paramList) {
      return {
        params: makeParams(keys, paramList),
        middlewares: handlers[req.method] || [notAllowed]
      };
    }
  };
}

export default class Router {
  #routes = [];

  route(path, middlewares, options) {
    this.#routes.push(makeRoute(path, middlewares, options));
  }

  get middleware() {
    const routes = this.#routes;

    return function routerMiddleware(req, res) {
      for (const route of routes) {
        const result = route(req);

        if (result) {
          this.set('params', result.params);

          return runner.call(this, req, res, result.middlewares);
        }
      }
    };
  }
}
