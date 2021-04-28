'use strict';

const { promisify } = require('util');
const textBody = promisify(require('body'));
const jsonBody = promisify(require('body/json'));
const formBody = promisify(require('body/form'));
const anyBody = promisify(require('body/any'));

function makeMiddleware(parser) {
  return options => function (req, res) {
    return parser(req, res, options)
      .then(body => void this.set('body', body));
  };
}

exports.text = makeMiddleware(textBody);
exports.json = makeMiddleware(jsonBody);
exports.form = makeMiddleware(formBody);
exports.any = makeMiddleware(anyBody);
