'use strict';

var assert = require('assert');
var sinon = require('sinon');
var SandboxedModule = require('sandboxed-module');

describe('Router', function () {
  var sandbox = sinon.sandbox.create();

  var Router;
  var StacksStub;
  var makeMiddlewareStub;
  var fakeStacks;

  before(function () {
    StacksStub = sinon.stub();
    makeMiddlewareStub = sinon.stub();

    Router = SandboxedModule.require('../lib/Router', {
      requires: {
        './Stacks': StacksStub,
        './makeMiddleware': makeMiddlewareStub
      }
    });
  });

  afterEach(function () {
    StacksStub.reset();
    makeMiddlewareStub.reset();
    sandbox.restore();
  });

  beforeEach(function () {
    fakeStacks = {
      add: sandbox.stub()
    };

    StacksStub.returns(fakeStacks);
    makeMiddlewareStub.returns('the-middleware');
  });

  it('is a function', function () {
    assert.equal(typeof Router, 'function');
  });

  it('throws when called without new', function () {
    assert.throws(
      function () {
        return Router(); // eslint-disable-line
      },
      function (err) {
        return err instanceof Error;
      },
      'Cannot call a class as a function'
    );
  });

  describe('instances', function () {
    var router;

    beforeEach(function () {
      router = new Router('options');
    });

    it('uses an empty object for the options property when initialized without options', function () {
      var router = new Router();

      assert.deepEqual(router.options, {});
    });

    it('uses the passed in options as the options property', function () {
      assert.equal(router.options, 'options');
    });

    it('initialises a router object with middleware stacks', function () {
      assert.equal(StacksStub.callCount, 1);
      assert.ok(StacksStub.calledWithNew());
      assert.equal(router.stacks, fakeStacks);
    });

    describe('add method', function () {
      beforeEach(function () {
        router.add('some-method', 'some-path', 'middleware-1', 'middleware-2');
      });

      it('calls add on the stacks property once', function () {
        assert.equal(fakeStacks.add.callCount, 1);
      });

      it('passes the method, the path, the options, and the middlewares to stacks.add', function () {
        assert.deepEqual(fakeStacks.add.args[0], [
          'some-method',
          'some-path',
          'options',
          ['middleware-1', 'middleware-2']
        ]);
      });
    });

    describe('middleware getter', function () {
      var middleware;

      beforeEach(function () {
        middleware = router.middleware;
      });

      it('calls makeMiddleware with this', function () {
        assert.equal(makeMiddlewareStub.callCount, 1);
        assert.equal(makeMiddlewareStub.args[0][0], router);
      });

      it('is the return value of makeMiddleware', function () {
        assert.equal(middleware, 'the-middleware');
      });
    });
  });
});
