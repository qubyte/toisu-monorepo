'use strict';

var assert = require('assert');
var sinon = require('sinon');
var parseGeneric = require('../../lib/parseGeneric');

describe('parseGeneric', function () {
  it('is a function', function () {
    assert.equal(typeof parseGeneric, 'function');
  });

  it('returns a promise', function () {
    assert.ok(parseGeneric('req', 'res', 'options', function () {}, new Map()) instanceof Promise, 'instanceof Promise');
  });

  it('calls the given parseFunction with req, res, options, and a callback', function () {
    var parseFunction = sinon.stub();

    parseGeneric('req', 'res', 'options', parseFunction, new Map());

    assert.equal(parseFunction.args[0][0], 'req', 'req');
    assert.equal(parseFunction.args[0][1], 'res', 'res');
    assert.equal(parseFunction.args[0][2], 'options', 'options');
    assert.equal(typeof parseFunction.args[0][3], 'function', 'callback');
  });

  it('defaults options to an empty object', function () {
    var parseFunction = sinon.stub();

    parseGeneric('req', 'res', undefined, parseFunction, new Map());

    assert.equal(parseFunction.args[0][0], 'req', 'req');
    assert.equal(parseFunction.args[0][1], 'res', 'res');
    assert.deepEqual(parseFunction.args[0][2], {}, 'defaults options to {}');
    assert.equal(typeof parseFunction.args[0][3], 'function', 'callback');
  });

  describe('when the parseFunction calls back with an error', function () {
    it('rejects the parseGeneric promise with the error', function () {
      var parseFunction = sinon.stub();
      var error = new Error();
      var promise = parseGeneric('req', 'res', 'options', parseFunction, new Map());

      parseFunction.yield(error);

      return promise.then(
        function () {
          throw new Error('did not reject');
        },
        function (e) {
          assert.equal(e, error, 'rejects with the error');
        }
      );
    });

    it('does not set the body property on the context', function () {
      var parseFunction = sinon.stub();
      var context = { set: sinon.stub() };
      var promise = parseGeneric('req', 'res', 'options', parseFunction, context);

      parseFunction.yield(new Error());

      return promise.then(
        function () {
          throw new Error('did not reject');
        },
        function () {
          assert.equal(context.set.callCount, 0, 'does not set the body');
        }
      );
    });
  });

  describe('when the parseFunction calls back with the body', function () {
    it('resolves the parseGeneric promise', function () {
      var parseFunction = sinon.stub();
      var promise = parseGeneric('req', 'res', 'options', parseFunction, new Map());

      parseFunction.yield(null, 'the-body');

      return promise;
    });

    it('sets the body on the context', function () {
      var parseFunction = sinon.stub();
      var context = { set: sinon.stub() };
      var promise = parseGeneric('req', 'res', 'options', parseFunction, context);

      parseFunction.yield(null, 'the-body');

      return promise.then(function () {
        assert.equal(context.set.callCount, 1, 'called once');
        assert.deepEqual(context.set.args[0], ['body', 'the-body'], 'sets the body');
      });
    });
  });
});
