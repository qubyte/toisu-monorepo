'use strict';

var Stacks = require('./Stacks');
var makeMiddleware = require('./makeMiddleware');

function Router(opts) {
  if (!(this instanceof Router)) {
    throw new TypeError('Cannot call a class as a function');
  }

  this.options = opts || {};
  this.stacks = new Stacks();
}

Router.prototype.add = function (method, path) {
  var middlewares = Array.prototype.slice.call(arguments, 2);

  this.stacks.add(method, path, this.options, middlewares);
};

Object.defineProperty(Router.prototype, 'middleware', {
  get: function () {
    return makeMiddleware(this);
  }
});

module.exports = Router;
