'use strict';

var http = require('http');
var pathToRegexp = require('path-to-regexp');
var makeParams = require('./makeParams');

function Stacks() {
  this.registered = Object.create(null);

  for (var i = 0, len = http.METHODS.length; i < len; i++) {
    this.registered[http.METHODS[i]] = [];
  }
}

Stacks.prototype.add = function (method, path, options, middlewares) {
  var keys = [];
  var regex = pathToRegexp(path, keys, options);
  var upperMethod = method.toUpperCase();

  if (http.METHODS.indexOf(upperMethod) === -1) {
    throw new Error('Method ' + upperMethod + ' not implemented.');
  }

  this.registered[upperMethod].push({
    regex: regex,
    keys: keys,
    middlewares: middlewares
  });
};

Stacks.prototype.matchRequest = function (method, url) {
  var stacks = this.registered[method.toUpperCase()];

  for (var i = 0, len = stacks.length; i < len; i++) {
    var stack = stacks[i];
    var paramList = stack.regex.exec(url);

    if (paramList) {
      return {
        params: makeParams(stack.keys, paramList),
        middlewares: stack.middlewares
      };
    }
  }
};

module.exports = Stacks;
