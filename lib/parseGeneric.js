'use strict';

function parseGeneric(req, res, options = {}, parseFunction, context) {
  return new Promise((resolve, reject) => {
    parseFunction(req, res, options, (err, body) => {
      if (err) {
        return reject(err);
      }

      context.set('body', body);
      resolve();
    });
  });
}

module.exports = parseGeneric;
