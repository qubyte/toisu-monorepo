'use strict';

var assert = require('assert');
var http = require('http');
var sinon = require('sinon');
var SandboxedModule = require('sandboxed-module');

describe('Stacks', function () {
  var sandbox = sinon.sandbox.create();

  var Stacks;
  var pathToRegexpStub;
  var makeParamsStub;

  before(function () {
    pathToRegexpStub = sinon.stub();
    makeParamsStub = sinon.stub();

    Stacks = SandboxedModule.require('../lib/Stacks', {
      requires: {
        http: http,
        'path-to-regexp': pathToRegexpStub,
        './makeParams': makeParamsStub
      }
    });
  });

  beforeEach(function () {
    pathToRegexpStub.returns('a-regex');
    makeParamsStub.returns('assembled-parameters');
  });

  afterEach(function () {
    sandbox.restore();
    pathToRegexpStub.reset();
  });

  it('is a function', function () {
    assert.equal(typeof Stacks, 'function');
  });

  describe('instances', function () {
    var stacks;

    beforeEach(function () {
      stacks = new Stacks();
    });

    it('constructs objects with a registered field', function () {
      assert.equal(typeof stacks.registered, 'object');
    });

    it('appends an empty array to the registered field for each http method', function () {
      var registeredKeys = Object.keys(stacks.registered);

      assert.deepEqual(registeredKeys.sort(), http.METHODS.sort());

      registeredKeys.forEach(function (key) {
        assert.deepEqual(stacks.registered[key], []);
      });
    });

    describe('add method', function () {
      beforeEach(function () {
        stacks.add('get', '/some/path', 'options', 'middlewares');
      });

      it('is a function', function () {
        assert.equal(typeof stacks.add, 'function');
      });

      it('throws an error when an invalid http method name is used', function () {
        assert.throws(
          function () {
            stacks.add('blah');
          },
          function (err) {
            return err instanceof Error;
          },
          'Method BLAH not implemented.'
        );
      });

      it('calls path-to-regexp with the path, an array to populate, and options', function () {
        assert.equal(pathToRegexpStub.callCount, 1);
        assert.deepEqual(pathToRegexpStub.args[0], ['/some/path', [], 'options']);
      });

      it('pushes an object into the stacks for the relevant method', function () {
        assert.equal(stacks.registered.GET.length, 1);
      });

      describe('object pushed into the stack', function () {
        it('has "regex", "keys" and "middlewares fields"', function () {
          assert.deepEqual(Object.keys(stacks.registered.GET[0]).sort(), ['keys', 'middlewares', 'regex']);
        });

        it('uses the return value of path-to-regexp as the "regex" field', function () {
          assert.equal(stacks.registered.GET[0].regex, 'a-regex');
        });

        it('uses the array passed to path-to-regexp as the "keys" field', function () {
          assert.equal(stacks.registered.GET[0].keys, pathToRegexpStub.args[0][1]);
        });

        it('uses the middlewares passed to add for as the "middlewares" field', function () {
          assert.equal(stacks.registered.GET[0].middlewares, 'middlewares');
        });
      });
    });

    describe('matchRequest method', function () {
      var exec;

      beforeEach(function () {
        exec = sandbox.stub();

        pathToRegexpStub.returns({
          exec: exec
        });

        stacks.add('get', 'some/path', 'options', 'first-middlewares');
        stacks.add('get', 'a/different/path', 'options', 'second-middlewares');
        stacks.add('post', 'some/other/path', 'options', 'third-middlewares');
      });

      it('is a function', function () {
        assert.equal(typeof stacks.matchRequest, 'function');
      });

      it('iterates over the stack assodiated with a method to exec regexes against a URL', function () {
        stacks.matchRequest('GET', 'the-url');

        assert.equal(exec.callCount, 2);
        assert.ok(exec.alwaysCalledWith('the-url'));
      });

      it('calls makeParams with the first matching stack keys and parameter list', function () {
        exec.returns('a-param-list');

        stacks.matchRequest('GET', 'the-url');

        assert.equal(makeParamsStub.callCount, 1);
        assert.equal(makeParamsStub.args[0][0], pathToRegexpStub.args[0][1]);
        assert.equal(makeParamsStub.args[0][1], 'a-param-list');
      });

      it('stops iterating when a match is found', function () {
        exec.returns('a-param-list');

        stacks.matchRequest('GET', 'the-url');

        assert.equal(exec.callCount, 1);
      });

      it('returns the middlewares as middlewares and the result of makeParams as params', function () {
        exec.returns('a-param-list');

        assert.deepEqual(stacks.matchRequest('GET', 'the-url'), {
          params: 'assembled-parameters',
          middlewares: 'first-middlewares'
        });
      });
    });
  });
});
