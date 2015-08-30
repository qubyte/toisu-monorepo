'use strict';

var runner = require('toisu-middleware-runner');

function makeMiddleware(router) {
  return function (req, res) {
    var stack = router.stacks.matchRequest(req.method, req.url);

    if (!stack) {
      return;
    }

    this.set('params', stack.params);

    return runner.call(this, req, res, stack.middlewares);
  };
}

module.exports = makeMiddleware;
