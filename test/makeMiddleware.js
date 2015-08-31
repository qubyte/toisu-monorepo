'use strict';

var assert = require('assert');
var sinon = require('sinon');
var SandboxedModule = require('sandboxed-module');

describe('makeMiddleware', function () {
  var sandbox = sinon.sandbox.create();
  var makeMiddleware;
  var runnerStub;
  var fakeRouter;

  before(function () {
    runnerStub = sinon.stub();

    makeMiddleware = SandboxedModule.require('../lib/makeMiddleware', {
      requires: {
        'toisu-middleware-runner': runnerStub
      }
    });
  });

  afterEach(function () {
    sandbox.restore();
    runnerStub.reset();
  });

  beforeEach(function () {
    runnerStub.returns('runner-return-value');

    fakeRouter = {
      stacks: {
        matchRequest: sandbox.stub()
      }
    };
  });

  it('is a function', function () {
    assert.equal(typeof makeMiddleware, 'function');
  });

  describe('when called', function () {
    var middleware;

    beforeEach(function () {
      middleware = makeMiddleware(fakeRouter);
    });

    it('returns a function', function () {
      assert.equal(typeof middleware, 'function');
    });

    describe('middleware', function () {
      var req;
      var res;
      var context;

      beforeEach(function () {
        req = {method: 'a-method', url: 'a-url'};
        res = 'res';
        context = {
          set: sandbox.stub()
        };
      });

      it('calls router.stacks.matchRequest with the method and url', function () {
        middleware.call(context, req, res);

        assert.equal(fakeRouter.stacks.matchRequest.callCount, 1);
        assert.deepEqual(fakeRouter.stacks.matchRequest.args[0], ['a-method', 'a-url']);
      });

      it('does nothing when the router had no matching middleware stack for the route and method', function () {
        middleware.call(context, req, res);

        assert.equal(runnerStub.callCount, 0);
        assert.equal(context.set.callCount, 0);
      });

      it('sets the params to the context when a stack matches the route and method', function () {
        fakeRouter.stacks.matchRequest.returns({
          params: 'some-params',
          middlewares: 'some-middlewares'
        });

        middleware.call(context, req, res);

        assert.equal(context.set.callCount, 1);
        assert.deepEqual(context.set.args[0], ['params', 'some-params']);
      });

      it('calls the runner with the middleware stack, with the context', function () {
        fakeRouter.stacks.matchRequest.returns({
          params: 'some-params',
          middlewares: 'some-middlewares'
        });

        middleware.call(context, req, res);

        assert.equal(runnerStub.callCount, 1);
        assert.equal(runnerStub.thisValues[0], context);
        assert.equal(runnerStub.args[0][0], req);
        assert.equal(runnerStub.args[0][1], res);
        assert.equal(runnerStub.args[0][2], 'some-middlewares');
      });

      it('returns the return of the runner', function () {
        fakeRouter.stacks.matchRequest.returns({
          params: 'some-params',
          middlewares: 'some-middlewares'
        });

        assert.equal(middleware.call(context, req, res), 'runner-return-value');
      });
    });
  });
});
