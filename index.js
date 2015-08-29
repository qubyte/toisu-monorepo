'use strict';

function runner(req, res, middlewares) {
  var context = this;

  function wrapper(index) {
    var middleware = middlewares && middlewares[index];

    if (!middleware || res.headersSent || !res.writable) {
      return Promise.resolve();
    }

    return Promise.resolve(middleware.call(context, req, res))
      .then(function () {
        return wrapper(index + 1);
      });
  }

  return wrapper(0);
}

module.exports = runner;
