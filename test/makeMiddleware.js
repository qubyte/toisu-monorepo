'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('makeMiddleware', () => {
  const sandbox = sinon.sandbox.create();

  let makeMiddleware;
  let runnerStub;
  let fakeRouter;

  before(() => {
    runnerStub = sinon.stub();

    makeMiddleware = SandboxedModule.require('../lib/makeMiddleware', {
      requires: {
        'toisu-middleware-runner': runnerStub
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
    runnerStub.reset();
  });

  beforeEach(() => {
    runnerStub.returns('runner-return-value');

    fakeRouter = {
      stacks: {
        matchRequest: sandbox.stub()
      }
    };
  });

  it('is a function', () => {
    assert.equal(typeof makeMiddleware, 'function');
  });

  describe('when called', () => {
    let middleware;

    beforeEach(() => {
      middleware = makeMiddleware(fakeRouter);
    });

    it('returns a function', () => {
      assert.equal(typeof middleware, 'function');
    });

    describe('middleware', () => {
      let req;
      let res;
      let context;

      beforeEach(() => {
        req = { method: 'a-method', url: 'a-url' };
        res = 'res';
        context = {
          set: sandbox.stub()
        };
      });

      it('calls router.stacks.matchRequest with the method and url', () => {
        middleware.call(context, req, res);

        assert.equal(fakeRouter.stacks.matchRequest.callCount, 1);
        assert.deepEqual(fakeRouter.stacks.matchRequest.args[0], ['a-method', 'a-url']);
      });

      it('does nothing when the router had no matching middleware stack for the route and method', () => {
        middleware.call(context, req, res);

        assert.equal(runnerStub.callCount, 0);
        assert.equal(context.set.callCount, 0);
      });

      it('sets the params to the context when a stack matches the route and method', () => {
        fakeRouter.stacks.matchRequest.returns({
          params: 'some-params',
          middlewares: 'some-middlewares'
        });

        middleware.call(context, req, res);

        assert.equal(context.set.callCount, 1);
        assert.deepEqual(context.set.args[0], ['params', 'some-params']);
      });

      it('calls the runner with the middleware stack, with the context', () => {
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

      it('returns the return of the runner', () => {
        fakeRouter.stacks.matchRequest.returns({
          params: 'some-params',
          middlewares: 'some-middlewares'
        });

        assert.equal(middleware.call(context, req, res), 'runner-return-value');
      });
    });
  });
});
