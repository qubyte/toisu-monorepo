'use strict';

function parseGeneric(req, res, options, parseFunction, context) {
  var parsePromise = new Promise(function (resolve, reject) {
    parseFunction(req, res, options || {}, function (err, body) {
      if (err) {
        return reject(err);
      }

      context.set('body', body);
      resolve();
    });
  });
}

module.exports = parseGeneric;
