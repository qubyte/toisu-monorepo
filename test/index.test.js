'use strict';

var tape = require('tape');
var sinon = require('sinon');
var SandboxedModule = require('sandboxed-module');

SandboxedModule.registerBuiltInSourceTransformer('istanbul');

var parseGenericStub = sinon.stub().returns('parse-generic-return-value');
var toisuBody = SandboxedModule.require('../', {
  requires: {
    './lib/parseGeneric': parseGenericStub,
    body: 'text-body',
    'body/json': 'json-body',
    'body/form': 'form-body',
    'body/any': 'any-body'
  }
});

// Must be called at the end of each test which calls a middleware function.
function reset() {
  parseGenericStub.reset();
}

tape('toisuBody', function (t) {
  t.test('is an object', function (t) {
    t.equal(typeof toisuBody, 'object', 'is an object');
    t.ok(toisuBody, 'is not null');
    t.end();
  });

  t.test('has text, json, form, and any methods', function (t) {
    t.deepEqual(Object.keys(toisuBody).sort(), ['any', 'form', 'json', 'text'], 'correct property names');
    t.equal(typeof toisuBody.text, 'function', 'text is a method');
    t.equal(typeof toisuBody.json, 'function', 'json is a method');
    t.equal(typeof toisuBody.form, 'function', 'form is a method');
    t.equal(typeof toisuBody.any, 'function', 'any is a method');
    t.end();
  });

  t.test('the text method', function (t) {
    t.test('returns a function', function (t) {
      t.equal(typeof toisuBody.text('options'), 'function', 'is a function');
      t.end();
    });

    t.test('the returned function passes req, res, options, the textBody function and the context', function (t) {
      var middleware = toisuBody.text('options');

      middleware.call('the-context', 'req', 'res');

      t.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      t.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'text-body', 'the-context']);
      t.end();
      reset();
    });

    t.test('returns the return value of parseGeneric', function (t) {
      var middleware = toisuBody.text('options');
      var returnValue = middleware.call('the-context', 'req', 'res');

      t.equal(returnValue, 'parse-generic-return-value');
      t.end();
      reset();
    });
  });

  t.test('the json method', function (t) {
    t.test('returns a function', function (t) {
      t.equal(typeof toisuBody.json('options'), 'function', 'is a function');
      t.end();
    });

    t.test('the returned function passes req, res, options, the jsonBody function and the context', function (t) {
      var middleware = toisuBody.json('options');

      middleware.call('the-context', 'req', 'res');

      t.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      t.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'json-body', 'the-context']);
      t.end();
      reset();
    });

    t.test('returns the return value of parseGeneric', function (t) {
      var middleware = toisuBody.json('options');
      var returnValue = middleware.call('the-context', 'req', 'res');

      t.equal(returnValue, 'parse-generic-return-value');
      t.end();
      reset();
    });
  });

  t.test('the form method', function (t) {
    t.test('returns a function', function (t) {
      t.equal(typeof toisuBody.form('options'), 'function', 'is a function');
      t.end();
    });

    t.test('the returned function passes req, res, options, the formBody function and the context', function (t) {
      var middleware = toisuBody.form('options');

      middleware.call('the-context', 'req', 'res');

      t.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      t.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'form-body', 'the-context']);
      t.end();
      reset();
    });

    t.test('returns the return value of parseGeneric', function (t) {
      var middleware = toisuBody.form('options');
      var returnValue = middleware.call('the-context', 'req', 'res');

      t.equal(returnValue, 'parse-generic-return-value');
      t.end();
      reset();
    });
  });

  t.test('the any method', function (t) {
    t.test('returns a function', function (t) {
      t.equal(typeof toisuBody.any('options'), 'function', 'is a function');
      t.end();
    });

    t.test('the returned function passes req, res, options, the anyBody function and the context', function (t) {
      var middleware = toisuBody.any('options');

      middleware.call('the-context', 'req', 'res');

      t.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      t.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'any-body', 'the-context']);
      t.end();
      reset();
    });

    t.test('returns the return value of parseGeneric', function (t) {
      var middleware = toisuBody.any('options');
      var returnValue = middleware.call('the-context', 'req', 'res');

      t.equal(returnValue, 'parse-generic-return-value');
      t.end();
      reset();
    });
  });
});
