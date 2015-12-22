'use strict';

const assert = require('assert');
const http = require('http');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('Stacks', () => {
  const sandbox = sinon.sandbox.create();

  let Stacks;
  let pathToRegexpStub;
  let makeParamsStub;

  before(() => {
    pathToRegexpStub = sinon.stub();
    makeParamsStub = sinon.stub();

    Stacks = SandboxedModule.require('../lib/Stacks', {
      requires: {
        http,
        'path-to-regexp': pathToRegexpStub,
        './makeParams': makeParamsStub
      }
    });
  });

  beforeEach(() => {
    pathToRegexpStub.returns('a-regex');
    makeParamsStub.returns('assembled-parameters');
  });

  afterEach(() => {
    sandbox.restore();
    pathToRegexpStub.reset();
  });

  it('is a function', () => {
    assert.equal(typeof Stacks, 'function');
  });

  describe('instances', () => {
    let stacks;

    beforeEach(() => {
      stacks = new Stacks();
    });

    it('constructs objects with a registered field', () => {
      assert.equal(typeof stacks.registered, 'object');
    });

    it('appends an empty array to the registered field for each http method', () => {
      const registeredKeys = Object.keys(stacks.registered);

      assert.deepEqual(registeredKeys.sort(), http.METHODS.sort());

      for (const key of registeredKeys) {
        assert.deepEqual(stacks.registered[key], []);
      }
    });

    describe('add method', () => {
      beforeEach(() => {
        stacks.add('get', '/some/path', 'options', 'middlewares');
      });

      it('is a function', () => {
        assert.equal(typeof stacks.add, 'function');
      });

      it('throws an error when an invalid http method name is used', () => {
        assert.throws(
          () => stacks.add('blah'),
          err => err instanceof Error,
          'Method BLAH not implemented.'
        );
      });

      it('calls path-to-regexp with the path, an array to populate, and options', () => {
        assert.equal(pathToRegexpStub.callCount, 1);
        assert.deepEqual(pathToRegexpStub.args[0], ['/some/path', [], 'options']);
      });

      it('pushes an object into the stacks for the relevant method', () => {
        assert.equal(stacks.registered.GET.length, 1);
      });

      describe('object pushed into the stack', () => {
        it('has "regex", "keys" and "middlewares fields"', () => {
          assert.deepEqual(Object.keys(stacks.registered.GET[0]).sort(), ['keys', 'middlewares', 'regex']);
        });

        it('uses the return value of path-to-regexp as the "regex" field', () => {
          assert.equal(stacks.registered.GET[0].regex, 'a-regex');
        });

        it('uses the array passed to path-to-regexp as the "keys" field', () => {
          assert.equal(stacks.registered.GET[0].keys, pathToRegexpStub.args[0][1]);
        });

        it('uses the middlewares passed to add for as the "middlewares" field', () => {
          assert.equal(stacks.registered.GET[0].middlewares, 'middlewares');
        });
      });
    });

    describe('matchRequest method', () => {
      let exec;

      beforeEach(() => {
        exec = sandbox.stub();

        pathToRegexpStub.returns({ exec });

        stacks.add('get', 'some/path', 'options', 'first-middlewares');
        stacks.add('get', 'a/different/path', 'options', 'second-middlewares');
        stacks.add('post', 'some/other/path', 'options', 'third-middlewares');
      });

      it('is a function', () => {
        assert.equal(typeof stacks.matchRequest, 'function');
      });

      it('iterates over the stack assodiated with a method to exec regexes against a URL', () => {
        stacks.matchRequest('GET', 'the-url');

        assert.equal(exec.callCount, 2);
        assert.ok(exec.alwaysCalledWith('the-url'));
      });

      it('calls makeParams with the first matching stack keys and parameter list', () => {
        exec.returns('a-param-list');

        stacks.matchRequest('GET', 'the-url');

        assert.equal(makeParamsStub.callCount, 1);
        assert.equal(makeParamsStub.args[0][0], pathToRegexpStub.args[0][1]);
        assert.equal(makeParamsStub.args[0][1], 'a-param-list');
      });

      it('stops iterating when a match is found', () => {
        exec.returns('a-param-list');

        stacks.matchRequest('GET', 'the-url');

        assert.equal(exec.callCount, 1);
      });

      it('returns the middlewares as middlewares and the result of makeParams as params', () => {
        exec.returns('a-param-list');

        assert.deepEqual(stacks.matchRequest('GET', 'the-url'), {
          params: 'assembled-parameters',
          middlewares: 'first-middlewares'
        });
      });
    });
  });
});
