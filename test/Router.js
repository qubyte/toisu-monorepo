'use strict';

const assert = require('assert');
const SandboxedModule = require('sandboxed-module');
const sinon = require('sinon');

describe('Router', () => {
  const sandbox = sinon.sandbox.create();
  const RouteStub = sandbox.stub();
  const makeMiddlewareStub = sandbox.stub();
  const route0 = {};
  const route1 = {};
  const route2 = {};

  let Router;

  before(() => {
    RouteStub.onCall(0).returns(route0);
    RouteStub.onCall(1).returns(route1);
    RouteStub.onCall(2).returns(route2);

    Router = SandboxedModule.require('../lib/Router', {
      requires: {
        './Route': RouteStub,
        './makeMiddleware': makeMiddlewareStub.returns('middleware')
      }
    });
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('constructs instances of itself', () => {
    assert.ok(new Router() instanceof Router);
  });

  describe('route', () => {
    let router;

    beforeEach(() => {
      router = new Router();
    });

    it('constructs a new Route with the given parameters', () => {
      router.route('test-path', 'middlewares', 'options-to-path-to-regexp');

      assert.deepEqual(RouteStub.args, [['test-path', 'middlewares', 'options-to-path-to-regexp']]);
      assert.ok(RouteStub.calledWithNew(), true);
    });
  });

  describe('get middleware', () => {
    let middleware;

    beforeEach(() => {
      const router = new Router();
      router.route('test-path-0', 'middlewares-0', 'options-to-path-to-regexp-0');
      router.route('test-path-1', 'middlewares-1', 'options-to-path-to-regexp-1');
      router.route('test-path-2', 'middlewares-2', 'options-to-path-to-regexp-2');
      middleware = router.middleware;
    });

    it('calls makeMiddleware with a list of routes', () => {
      assert.equal(makeMiddlewareStub.callCount, 1);
      assert.equal(makeMiddlewareStub.args[0][0].length, 3);
      assert.equal(makeMiddlewareStub.args[0][0][0], route0);
      assert.equal(makeMiddlewareStub.args[0][0][1], route1);
      assert.equal(makeMiddlewareStub.args[0][0][2], route2);
    });

    it('returns the return value of makeMiddleware', () => {
      assert.equal(middleware, 'middleware');
    });
  });
});
