'use strict';

const assert = require('assert');
const normalizeHandlers = require('../lib/normalizeHandlers');

describe('normalizeHandlers', () => {
  it('is a function', () => {
    assert.equal(typeof normalizeHandlers, 'function');
  });

  it('throws when called without an object', () => {
    assert.throws(
      () => normalizeHandlers(),
      Error,
      'Handlers must be an object with HTTP methods as keys.'
    );
  });

  it('throws when called with an object with an unknown HTTP method as a key', () => {
    assert.throws(
      () => normalizeHandlers({ blah: [] }),
      Error,
      'Unknown method: blah'
    );
  });

  it('throws when called with an object with the same HTTP method twice', () => {
    assert.throws(
      () => normalizeHandlers({ get: [], GET: [] }),
      Error,
      'A method can only be used once: GET'
    );
  });

  it('throws when called with a callbacks list which is not an array', () => {
    assert.throws(
      () => normalizeHandlers({ get: 'blah' }),
      Error,
      'A method can only be used once: GET'
    );
  });

  it('returns an new object with upper-cased HTTP method name', () => {
    const getHandlers = [];
    const postHandlers = [];
    const original = { get: getHandlers, POST: postHandlers };
    const normalized = normalizeHandlers(original);

    assert.notEqual(original, normalized);
    assert.deepEqual(normalized, {
      GET: getHandlers,
      POST: postHandlers
    });
  });
});
