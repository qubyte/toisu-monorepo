'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

SandboxedModule.registerBuiltInSourceTransformer('istanbul');

function requireModule(serveStaticStub) {
  return SandboxedModule.require('../', {
    requires: {
      'serve-static': serveStaticStub
    },
    globals: {
      Promise
    }
  });
}

describe('toisu-static', () => {
  it('is a function', () => {
    assert.equal(typeof requireModule(), 'function');
  });

  it('calls serve-static with the given root and options', () => {
    const serveStaticStub = sinon.stub();
    const toisuStatic = requireModule(serveStaticStub);

    toisuStatic('root', 'options');

    assert.equal(serveStaticStub.callCount, 1);
    assert.deepEqual(serveStaticStub.args[0], ['root', 'options'], 'is passed root and options');
  });

  it('returns a middleware function', () => {
    const serveStaticStub = sinon.stub();
    const toisuStatic = requireModule(serveStaticStub);

    assert.equal(typeof toisuStatic(), 'function', 'is a function');
  });

  it('returns a promise when the middleware is called', () => {
    const serveStaticStub = sinon.stub().returns(() => {});
    const toisuStatic = requireModule(serveStaticStub);
    const middleware = toisuStatic();
    const promise = middleware('req', 'res');

    assert.ok(promise instanceof Promise, 'is a promise');
  });

  it('passes the request, response, and a callback to the internal private serve function', () => {
    const privateServeStub = sinon.stub();
    const serveStaticStub = sinon.stub().returns(privateServeStub);
    const toisuStatic = requireModule(serveStaticStub);
    const middleware = toisuStatic();

    middleware('req', 'res');

    assert.equal(privateServeStub.callCount, 1, 'called once');
    assert.deepEqual(privateServeStub.args[0][0], 'req', 'passed request');
    assert.deepEqual(privateServeStub.args[0][1], 'res', 'passed response');
    assert.deepEqual(typeof privateServeStub.args[0][2], 'function', 'passed callback');
  });

  it('rejects the middleware promise when the private serve function calls back with an error', async () => {
    const privateServeStub = sinon.stub();
    const serveStaticStub = sinon.stub().returns(privateServeStub);
    const toisuStatic = requireModule(serveStaticStub);
    const middleware = toisuStatic();

    const promise = middleware('req', 'res');
    privateServeStub.yield('an error');

    try {
      await promise;
    } catch (e) {
      assert.equal(e, 'an error', 'rejects with the error from the private serve callback');
      return;
    }

    throw new Error('Promise should not resolve.');
  });

  it('resolves the middleware promise when the private serve function calls back without an error', () => {
    const privateServeStub = sinon.stub();
    const serveStaticStub = sinon.stub().returns(privateServeStub);
    const toisuStatic = requireModule(serveStaticStub);
    const middleware = toisuStatic();

    const promise = middleware('req', 'res');
    privateServeStub.yield();

    return promise;
  });
});
