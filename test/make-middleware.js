'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('makeMiddleware', () => {
  const sandbox = sinon.createSandbox();
  const runnerStub = sandbox.stub();

  let makeMiddleware;
  let middleware;
  let routes;

  before(() => {
    makeMiddleware = SandboxedModule.require('../lib/make-middleware', {
      requires: {
        'toisu-middleware-runner': runnerStub
      }
    });
  });

  beforeEach(() => {
    routes = [
      { match: sandbox.stub() },
      { match: sandbox.stub() },
      { match: sandbox.stub() }
    ];

    middleware = makeMiddleware(routes);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('is a function', () => {
    assert.equal(typeof makeMiddleware, 'function');
  });

  it('returns a function', () => {
    assert.equal(typeof middleware, 'function');
  });

  describe('calls to the middleware', () => {
    describe('when no routes match', () => {
      let returnVal;

      beforeEach(() => {
        returnVal = middleware.call(new Map(), 'req', 'res');
      });

      it('calls each .match on each router with the request', () => {
        assert.deepEqual(routes[0].match.args, [['req']]);
        assert.deepEqual(routes[1].match.args, [['req']]);
        assert.deepEqual(routes[2].match.args, [['req']]);

        assert.ok(routes[0].match.calledBefore(routes[1].match));
        assert.ok(routes[1].match.calledBefore(routes[2].match));
      });

      it('returns undefined', () => {
        assert.strictEqual(returnVal, undefined);
      });
    });

    describe('when a route matches', () => {
      let context;
      let returnVal;

      beforeEach(() => {
        routes[1].match.returns({ params: 'some-params', middlewares: 'some-middlewares' });
        runnerStub.returns('runner-return-val');
        context = new Map();
        returnVal = middleware.call(context, 'req', 'res');
      });

      it('stops calling .match when a request matches a route', () => {
        assert.deepEqual(routes[0].match.args, [['req']]);
        assert.deepEqual(routes[1].match.args, [['req']]);
        assert.deepEqual(routes[2].match.callCount, 0);

        assert.ok(routes[0].match.calledBefore(routes[1].match));
      });

      it('sets parameters on the context', () => {
        assert.equal(context.get('params'), 'some-params');
      });

      it('passes the middlewares to toisu-middleware-runner with the context', () => {
        assert.deepEqual(runnerStub.args, [['req', 'res', 'some-middlewares']]);
        assert.equal(runnerStub.thisValues[0], context);
      });

      it('returns the return value of the call to toisu-middleware-runner', () => {
        assert.equal(returnVal, 'runner-return-val');
      });
    });
  });
});
