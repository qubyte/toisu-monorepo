'use strict';

var tape = require('tape');
var sinon = require('sinon');
var parseGeneric = require('../../lib/parseGeneric');

tape('parseGeneric', function (t) {
  t.test('is a function', function (t) {
    t.equal(typeof parseGeneric, 'function');
    t.end();
  });

  t.test('returns a promise', function (t) {
    t.ok(parseGeneric('req', 'res', 'options') instanceof Promise, 'instanceof Promise');
    t.end();
  });

  t.test('calls the given parseFunction with req, res, options, and a callback', function (t) {
    var parseFunction = sinon.stub();
    parseGeneric('req', 'res', 'options', parseFunction, new Map());

    t.equal(parseFunction.args[0][0], 'req', 'req');
    t.equal(parseFunction.args[0][1], 'res', 'res');
    t.equal(parseFunction.args[0][2], 'options', 'options');
    t.equal(typeof parseFunction.args[0][3], 'function', 'callback');
    t.end();
  });

  t.test('defaults options to an empty object', function (t) {
    var parseFunction = sinon.stub();
    parseGeneric('req', 'res', undefined, parseFunction, new Map());

    t.equal(parseFunction.args[0][0], 'req', 'req');
    t.equal(parseFunction.args[0][1], 'res', 'res');
    t.deepEqual(parseFunction.args[0][2], {}, 'defaults options to {}');
    t.equal(typeof parseFunction.args[0][3], 'function', 'callback');
    t.end();
  });

  t.test('when the parseFunction calls back with an error', function (t) {
    t.test('it rejects the parseGeneric promise with the error', function (t) {
      var parseFunction = sinon.stub();
      var error = new Error();
      var promise = parseGeneric('req', 'res', 'options', parseFunction, new Map());

      parseFunction.yield(error);

      promise.then(
        function () {
          t.fail('did not reject');
          t.end();
        },
        function (e) {
          t.equal(e, error, 'rejects with the error');
          t.end();
        }
      );
    });

    t.test('it does not set the body property on the context', function (t) {
      var parseFunction = sinon.stub();
      var error = new Error();
      var context = { set: sinon.stub() };
      var promise = parseGeneric('req', 'res', 'options', parseFunction, context);

      parseFunction.yield(error);

      promise.then(
        function () {
          t.fail('did not reject');
          t.end();
        },
        function () {
          t.equal(context.set.callCount, 0, 'does not set the body');
          t.end();
        }
      );
    });
  });

  t.test('when the parseFunction calls back with the body', function (t) {
    t.test('it resolves the parseGeneric promise', function (t) {
      var parseFunction = sinon.stub();
      var promise = parseGeneric('req', 'res', 'options', parseFunction, new Map());

      parseFunction.yield(null, 'the-body');

      promise
        .then(function () {
          t.end();
        });
    });

    t.test('it sets the body on the context', function (t) {
      var parseFunction = sinon.stub();
      var context = { set: sinon.stub() };
      var promise = parseGeneric('req', 'res', 'options', parseFunction, context);

      parseFunction.yield(null, 'the-body');

      promise.then(
        function () {
          t.equal(context.set.callCount, 1, 'called once');
          t.deepEqual(context.set.args[0], ['body', 'the-body'], 'sets the body');
          t.end();
        },
        function () {
          t.fail('rejected');
          t.end();
        }
      );
    });
  });
});
