'use strict';

const http = require('http');
const pathToRegexp = require('path-to-regexp');
const makeParams = require('./makeParams');

class Stacks {
  constructor() {
    this.registered = Object.create(null);

    for (const method of http.METHODS) {
      this.registered[method] = [];
    }
  }

  add(method, path, options, middlewares) {
    const keys = [];
    const regex = pathToRegexp(path, keys, options);
    const upperMethod = method.toUpperCase();

    if (http.METHODS.indexOf(upperMethod) === -1) {
      throw new Error(`Method ${upperMethod} not implemented.`);
    }

    this.registered[upperMethod].push({ regex, keys, middlewares });
  }

  matchRequest(method, url) {
    const stacks = this.registered[method.toUpperCase()];

    for (const stack of stacks) {
      const paramList = stack.regex.exec(url);

      if (paramList) {
        return {
          params: makeParams(stack.keys, paramList),
          middlewares: stack.middlewares
        };
      }
    }
  }
}

module.exports = Stacks;
