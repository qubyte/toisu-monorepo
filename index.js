'use strict';

async function runner(req, res, middlewares = []) {
  for (const middleware of middlewares) {
    if (res.headersSent || !res.writable) {
      return;
    }

    await middleware.call(this, req, res);
  }
}

module.exports = runner;
