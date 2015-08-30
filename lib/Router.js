'use strict';

var Stacks = require('./Stacks');
var makeMiddleware = require('./makeMiddleware');

function Router(opts) {
  this.options = opts || {};
  this.stacks = new Stacks();
}

Router.prototype.add = function (method, path) {
  var middlewares = arguments.slice(2);

  this.stacks.add(method, path, this.options, middlewares);
};

Object.defineProperty(Router.prototype, 'middleware', {
  get: function () {
    return makeMiddleware(this);
  }
});

module.exports = Router;
