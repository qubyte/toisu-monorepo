'use strict';

var textBody = require('body');
var jsonBody = require('body/json');
var formBody = require('body/form');
var anyBody = require('body/any');
var parseGeneric = require('./lib/parseGeneric');

exports.text = function (options) {
  return function parseText(req, res) {
    return parseGeneric(req, res, options, textBody, this);
  };
};

exports.json = function (options) {
  return function parseJson(req, res) {
    return parseGeneric(req, res, options, jsonBody, this);
  };
};

exports.form = function (options) {
  return function parseForm(req, res) {
    return parseGeneric(req, res, options, formBody, this);
  };
};

exports.any = function (options) {
  return function parseAny(req, res) {
    return parseGeneric(req, res, options, anyBody, this);
  };
};
