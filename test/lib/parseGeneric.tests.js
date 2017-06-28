'use strict';

const assert = require('assert');
const sinon = require('sinon');
const parseGeneric = require('../../lib/parseGeneric');

describe('parseGeneric', () => {
  it('is a function', () => {
    assert.equal(typeof parseGeneric, 'function');
  });

  it('returns a promise', () => {
    assert.ok(parseGeneric('req', 'res', 'options', () => {}, new Map()) instanceof Promise, 'instanceof Promise');
  });

  it('calls the given parseFunction with req, res, options, and a callback', () => {
    const parseFunction = sinon.stub();

    parseGeneric('req', 'res', 'options', parseFunction, new Map());

    assert.equal(parseFunction.args[0][0], 'req', 'req');
    assert.equal(parseFunction.args[0][1], 'res', 'res');
    assert.equal(parseFunction.args[0][2], 'options', 'options');
    assert.equal(typeof parseFunction.args[0][3], 'function', 'callback');
  });

  it('defaults options to an empty object', () => {
    const parseFunction = sinon.stub();

    parseGeneric('req', 'res', undefined, parseFunction, new Map());

    assert.equal(parseFunction.args[0][0], 'req', 'req');
    assert.equal(parseFunction.args[0][1], 'res', 'res');
    assert.deepEqual(parseFunction.args[0][2], {}, 'defaults options to {}');
    assert.equal(typeof parseFunction.args[0][3], 'function', 'callback');
  });

  describe('when the parseFunction calls back with an error', () => {
    it('rejects the parseGeneric promise with the error', () => {
      const parseFunction = sinon.stub();
      const error = new Error();
      const promise = parseGeneric('req', 'res', 'options', parseFunction, new Map());

      parseFunction.yield(error);

      return promise.then(
        () => {
          throw new Error('did not reject');
        },
        e => {
          assert.equal(e, error, 'rejects with the error');
        }
      );
    });

    it('does not set the body property on the context', () => {
      const parseFunction = sinon.stub();
      const context = { set: sinon.stub() };
      const promise = parseGeneric('req', 'res', 'options', parseFunction, context);

      parseFunction.yield(new Error());

      return promise.then(
        () => {
          throw new Error('did not reject');
        },
        () => {
          assert.equal(context.set.callCount, 0, 'does not set the body');
        }
      );
    });
  });

  describe('when the parseFunction calls back with the body', () => {
    it('resolves the parseGeneric promise', () => {
      const parseFunction = sinon.stub();
      const promise = parseGeneric('req', 'res', 'options', parseFunction, new Map());

      parseFunction.yield(null, 'the-body');

      return promise;
    });

    it('sets the body on the context', () => {
      const parseFunction = sinon.stub();
      const context = { set: sinon.stub() };
      const promise = parseGeneric('req', 'res', 'options', parseFunction, context);

      parseFunction.yield(null, 'the-body');

      return promise.then(() => {
        assert.equal(context.set.callCount, 1, 'called once');
        assert.deepEqual(context.set.args[0], ['body', 'the-body'], 'sets the body');
      });
    });
  });
});
