'use strict';

const pathToRegexp = require('path-to-regexp');
const normalizeHandlers = require('./normalizeHandlers');
const makeParams = require('./makeParams');

function makeNotAllowed(allowedMethods) {
  return function notAllowed(req, res) {
    res.writeHead(405, { Allow: allowedMethods });
    res.end();
  };
}

class Route {
  constructor(path, preNormalizedHandlers, options) {
    this.handlers = normalizeHandlers(preNormalizedHandlers);

    const allowedMethods = Object.keys(this.handlers);

    this.allowed = allowedMethods.sort().join(', ');
    this.keys = [];
    this.regex = pathToRegexp(path, this.keys, options);
  }

  match(req) {
    const paramList = this.regex.exec(req.url);

    if (paramList) {
      return {
        params: makeParams(this.keys, paramList),
        middlewares: this.handlers[req.method] || [makeNotAllowed(this.allowed)]
      };
    }
  }
}

module.exports = Route;
