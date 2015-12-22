'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('Router', () => {
  const sandbox = sinon.sandbox.create();

  let Router;
  let StacksStub;
  let makeMiddlewareStub;
  let fakeStacks;

  before(() => {
    StacksStub = sinon.stub();
    makeMiddlewareStub = sinon.stub();

    Router = SandboxedModule.require('../lib/Router', {
      requires: {
        './Stacks': StacksStub,
        './makeMiddleware': makeMiddlewareStub
      }
    });
  });

  afterEach(() => {
    StacksStub.reset();
    makeMiddlewareStub.reset();
    sandbox.restore();
  });

  beforeEach(() => {
    fakeStacks = {
      add: sandbox.stub()
    };

    StacksStub.returns(fakeStacks);
    makeMiddlewareStub.returns('the-middleware');
  });

  it('is a function', () => {
    assert.equal(typeof Router, 'function');
  });

  describe('instances', () => {
    let router;

    beforeEach(() => {
      router = new Router('options');
    });

    it('uses an empty object for the options property when initialized without options', () => {
      const router = new Router();

      assert.deepEqual(router.options, {});
    });

    it('uses the passed in options as the options property', () => {
      assert.equal(router.options, 'options');
    });

    it('initialises a router object with middleware stacks', () => {
      assert.equal(StacksStub.callCount, 1);
      assert.ok(StacksStub.calledWithNew());
      assert.equal(router.stacks, fakeStacks);
    });

    describe('add method', () => {
      let returnVal;

      beforeEach(() => {
        returnVal = router.add('some-method', 'some-path', 'middleware-1', 'middleware-2');
      });

      it('calls add on the stacks property once', () => {
        assert.equal(fakeStacks.add.callCount, 1);
      });

      it('passes the method, the path, the options, and the middlewares to stacks.add', () => {
        assert.deepEqual(fakeStacks.add.args[0], [
          'some-method',
          'some-path',
          'options',
          ['middleware-1', 'middleware-2']
        ]);
      });

      it('returns the router instance', () => {
        assert.equal(returnVal, router);
      });
    });

    describe('middleware getter', () => {
      let middleware;

      beforeEach(() => {
        middleware = router.middleware;
      });

      it('calls makeMiddleware with this', () => {
        assert.equal(makeMiddlewareStub.callCount, 1);
        assert.equal(makeMiddlewareStub.args[0][0], router);
      });

      it('is the return value of makeMiddleware', () => {
        assert.equal(middleware, 'the-middleware');
      });
    });
  });
});
