'use strict';

var tape = require('tape');
var sinon = require('sinon');
var SandboxedModule = require('sandboxed-module');

SandboxedModule.registerBuiltInSourceTransformer('istanbul');

function requireModule(serveStaticStub) {
  return SandboxedModule.require('../', {
    requires: {
      'serve-static': serveStaticStub
    },
    globals: {
      Promise: Promise
    }
  });
}

tape('toisu-static', function (t) {
  t.test('is a function', function (t) {
    t.equal(typeof requireModule(), 'function', 'is a function');
    t.end();
  });

  t.test('calls serve-static with the given root and options', function (t) {
    var serveStaticStub = sinon.stub();
    var toisuStatic = requireModule(serveStaticStub);
    toisuStatic('root', 'options');

    t.equal(serveStaticStub.callCount, 1);
    t.deepEqual(serveStaticStub.args[0], ['root', 'options'], 'is passed root and options');
    t.end();
  });

  t.test('returns a middleware function', function (t) {
    var serveStaticStub = sinon.stub();
    var toisuStatic = requireModule(serveStaticStub);

    t.equal(typeof toisuStatic(), 'function', 'is a function');
    t.end();
  });

  t.test('it returns a promise when the middleware is called', function (t) {
    var serveStaticStub = sinon.stub();
    var toisuStatic = requireModule(serveStaticStub);
    var middleware = toisuStatic();
    var promise = middleware('req', 'res');

    t.ok(promise instanceof Promise, 'is a promise');
    t.end();
  });

  t.test('it passes the request, response, and a callback to the internal private serve function', function (t) {
    var privateServeStub = sinon.stub();
    var serveStaticStub = sinon.stub().returns(privateServeStub);
    var toisuStatic = requireModule(serveStaticStub);
    var middleware = toisuStatic();

    middleware('req', 'res');

    t.equal(privateServeStub.callCount, 1, 'called once');
    t.deepEqual(privateServeStub.args[0][0], 'req', 'passed request');
    t.deepEqual(privateServeStub.args[0][1], 'res', 'passed response');
    t.deepEqual(typeof privateServeStub.args[0][2], 'function', 'passed callback');
    t.end();
  });

  t.test('it rejects the middleware promise when the private serve function calls back with an error', function (t) {
    var privateServeStub = sinon.stub();
    var serveStaticStub = sinon.stub().returns(privateServeStub);
    var toisuStatic = requireModule(serveStaticStub);
    var middleware = toisuStatic();

    var promise = middleware('req', 'res');
    privateServeStub.yield('an error');

    promise.then(
      function () {
        t.fail('promise resolved');
        t.end();
      },
      function (e) {
        t.equal(e, 'an error', 'rejects with the error from the private serve callback');
        t.end();
      }
    );
  });

  t.test('it resolves the middleware promise when the private serve function calls back without an error', function (t) {
    var privateServeStub = sinon.stub();
    var serveStaticStub = sinon.stub().returns(privateServeStub);
    var toisuStatic = requireModule(serveStaticStub);
    var middleware = toisuStatic();

    var promise = middleware('req', 'res');
    privateServeStub.yield();

    promise.then(
      function () {
        t.end();
      },
      function () {
        t.fail('promise rejected');
        t.end();
      }
    );
  });
});
