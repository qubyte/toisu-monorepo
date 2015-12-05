'use strict';

var serveStatic = require('serve-static');

function makeStaticMiddleware(root, options) {
  var serve = serveStatic(root, options);

  return function staticMiddleware(req, res) {
    return new Promise(function (resolve, reject) {
      serve(req, res, function (err) {
        return err ? reject(err) : resolve();
      });
    });
  };
}

module.exports = makeStaticMiddleware;
