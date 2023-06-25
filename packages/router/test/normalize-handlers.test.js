import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import normalizeHandlers from '../lib/normalize-handlers.js';

describe('normalizeHandlers', () => {
  it('is a function', () => {
    assert.equal(typeof normalizeHandlers, 'function');
  });

  it('throws when called without an object', () => {
    assert.throws(
      () => normalizeHandlers(),
      new Error('Handlers must be an object with HTTP methods as keys.')
    );
  });

  it('throws when called with an object with an unknown HTTP method as a key', () => {
    assert.throws(
      () => normalizeHandlers({ blah: [] }),
      new Error('Unknown method: blah')
    );
  });

  it('throws when called with an object with the same HTTP method twice', () => {
    assert.throws(
      () => normalizeHandlers({ get: [], GET: [] }),
      new Error('A method can only be used once: GET')
    );
  });

  it('throws when called with a callbacks list which is not an array', () => {
    assert.throws(
      () => normalizeHandlers({ get: 'blah' }),
      new Error('Middleware for a method must be in an array.')
    );
  });

  it('returns an new object with upper-cased HTTP method name', () => {
    const getHandlers = [];
    const postHandlers = [];
    const original = { get: getHandlers, POST: postHandlers };
    const normalized = normalizeHandlers(original);

    assert.notEqual(original, normalized);
    assert.deepEqual(normalized, Object.assign(Object.create(null), {
      GET: getHandlers,
      POST: postHandlers
    }));
  });
});
