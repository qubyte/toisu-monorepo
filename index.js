'use strict';

var textBody = require('body');
var jsonBody = require('body/json');
var formBody = require('body/form');
var anyBody = require('body/any');
var parseGeneric = require('./lib/parseGeneric');

function makeMiddleware(parser) {
  return function (options) {
    return function (req, res) {
      return parseGeneric(req, res, options, parser, this);
    };
  };
}

exports.text = makeMiddleware(textBody);
exports.json = makeMiddleware(jsonBody);
exports.form = makeMiddleware(formBody);
exports.any = makeMiddleware(anyBody);
