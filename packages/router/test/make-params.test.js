import { strict as assert } from 'assert';
import makeParams from '../lib/make-params.js';

describe('makeParams', () => {
  let params;

  beforeEach(() => {
    const defs = [
      { name: 'foo' },
      { name: 'bar' }
    ];

    const list = [
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
    assert.deepEqual(params, Object.assign(Object.create(null), {
      foo: 'abc',
      bar: 'def'
    }));
  });
});
