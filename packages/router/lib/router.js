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

// TODO: Make this a private class initialzer when ESLint supports it.
const routes = new WeakMap();

export default class Router {
  constructor() {
    routes.set(this, []);
  }

  route(path, middlewares, options) {
    routes.get(this).push(makeRoute(path, middlewares, options));
  }

  get middleware() {
    const routerRoutes = routes.get(this);

    return function routerMiddleware(req, res) {
      for (const route of routerRoutes) {
        const result = route(req);

        if (result) {
          this.set('params', result.params);

          return runner.call(this, req, res, result.middlewares);
        }
      }
    };
  }
}
