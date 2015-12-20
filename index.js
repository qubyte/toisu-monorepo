'use strict';

function runner(req, res, middlewares) {
  var context = this;

  function makeWrapper(index) {
    return function wrapper() {
      var middleware = middlewares && middlewares[index];

      if (middleware && !res.headersSent && res.writable) {
        return Promise.resolve(middleware.call(context, req, res)).then(makeWrapper(index + 1));
      }
    };
  }

  return Promise.resolve().then(makeWrapper(0));
}

module.exports = runner;
