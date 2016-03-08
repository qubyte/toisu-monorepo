'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');
const pathToRegexp = require('path-to-regexp');

describe('Route', () => {
  const sandbox = sinon.sandbox.create();
  const pathToRegexpSpy = sandbox.spy(pathToRegexp);

  let Route;

  before(() => {
    Route = SandboxedModule.require('../lib/Route', {
      requires: {
        'path-to-regexp': pathToRegexpSpy
      }
    });
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('constructs instances of itself', () => {
    assert.ok(new Route('a/b/c', {}) instanceof Route);
  });

  it('passes options to pathToRegexp', () => {
    const options = {};

    (function makeRoute() {
      return new Route('a/b/c', {}, options);
    }());

    assert.equal(pathToRegexpSpy.args[0][2], options);
  });

  describe('match', () => {
    let route;
    let getMiddlewares;

    beforeEach(() => {
      getMiddlewares = [];

      route = new Route('/some/path/:someParam', {
        GET: getMiddlewares,
        POST: []
      });
    });

    describe('requests with a differing path', () => {
      it('returns undefined when req.url does not match', () => {
        assert.strictEqual(route.match({ url: '/blah' }), undefined);
      });
    });

    describe('requests with the same path but no matching HTTP method', () => {
      let result;

      beforeEach(() => {
        result = route.match({ url: '/some/path/123', method: 'DELETE' });
      });

      it('returns an object with a params object and a middlewares array', () => {
        assert.deepEqual(Object.keys(result).sort(), ['middlewares', 'params']);
        assert.deepEqual(result.params, { someParam: '123' });
        assert.ok(Array.isArray(result.middlewares));
      });

      it('populates the middlewares list with a single middleware', () => {
        assert.equal(result.middlewares.length, 1);
        assert.equal(typeof result.middlewares[0], 'function');
      });

      it('sets the middleware to respond with 405 and append an Allow header', () => {
        const middleware = result.middlewares[0];
        const res = {
          writeHead: sandbox.stub(),
          end: sandbox.stub()
        };

        middleware('req', res);

        assert.deepEqual(res.writeHead.args, [[405, { Allow: 'GET, POST' }]]);
        assert.deepEqual(res.end.args, [[]]);
        assert.ok(res.end.calledAfter(res.writeHead));
      });
    });

    describe('requests with the same path and a matching HTTP method', () => {
      let result;

      beforeEach(() => {
        result = route.match({ url: '/some/path/123', method: 'GET' });
      });

      it('returns an object with a params object and a middlewares array', () => {
        assert.deepEqual(Object.keys(result).sort(), ['middlewares', 'params']);
        assert.deepEqual(result.params, { someParam: '123' });
        assert.ok(Array.isArray(result.middlewares));
      });

      it('uses the handler middlwares in the returned object', () => {
        assert.equal(result.middlewares, getMiddlewares);
      });
    });
  });
});
