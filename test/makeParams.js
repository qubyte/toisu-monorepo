'use strict';

var assert = require('assert');
var makeParams = require('../lib/makeParams');

describe('makeParams', function () {
  var defs;
  var list;
  var params;

  beforeEach(function () {
    defs = [
      {name: 'foo'},
      {name: 'bar'}
    ];

    list = [
      'something-path-related',
      'abc',
      'def'
    ];

    params = makeParams(defs, list);
  });

  it('is a function', function () {
    assert.equal(typeof makeParams, 'function');
  });

  it('retuns an object with no prototype', function () {
    assert.equal(Object.getPrototypeOf(params), null);
  });

  it('returns an object with merged param definitions and param values', function () {
    assert.deepEqual(params, {
      foo: 'abc',
      bar: 'def'
    });
  });
});
