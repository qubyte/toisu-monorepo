'use strict';

const assert = require('assert');
const makeParams = require('../lib/makeParams');

describe('makeParams', () => {
  let defs;
  let list;
  let params;

  beforeEach(() => {
    defs = [
      { name: 'foo' },
      { name: 'bar' }
    ];

    list = [
      'something-path-related',
      'abc',
      'def'
    ];

    params = makeParams(defs, list);
  });

  it('is a function', () => {
    assert.equal(typeof makeParams, 'function');
  });

  it('retuns an object with no prototype', () => {
    assert.equal(Object.getPrototypeOf(params), null);
  });

  it('returns an object with merged param definitions and param values', () => {
    assert.deepEqual(params, {
      foo: 'abc',
      bar: 'def'
    });
  });
});
