import { pathToRegexp } from 'path-to-regexp';
import normalizeHandlers from './normalize-handlers.js';
import makeParams from './make-params.js';
import url from 'url';

function makeNotAllowed(allowedMethods) {
  return function notAllowed(req, res) {
    res.writeHead(405, { Allow: allowedMethods });
    res.end();
  };
}

export default class Route {
  constructor(path, preNormalizedHandlers, options) {
    this.handlers = normalizeHandlers(preNormalizedHandlers);

    const allowedMethods = Object.keys(this.handlers);

    this.allowed = allowedMethods.sort().join(', ');
    this.keys = [];
    this.regex = pathToRegexp(path, this.keys, options);
  }

  match(req) {
    const pathname = url.parse(req.url).pathname;
    const paramList = this.regex.exec(pathname);

    if (paramList) {
      return {
        params: makeParams(this.keys, paramList),
        middlewares: this.handlers[req.method] || [makeNotAllowed(this.allowed)]
      };
    }
  }
}
