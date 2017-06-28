'use strict';

const textBody = require('body');
const jsonBody = require('body/json');
const formBody = require('body/form');
const anyBody = require('body/any');
const parseGeneric = require('./lib/parseGeneric');

function makeMiddleware(parser) {
  return options => function (req, res) {
    return parseGeneric(req, res, options, parser, this);
  };
}

exports.text = makeMiddleware(textBody);
exports.json = makeMiddleware(jsonBody);
exports.form = makeMiddleware(formBody);
exports.any = makeMiddleware(anyBody);
