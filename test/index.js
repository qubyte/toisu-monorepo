'use strict';

var assert = require('assert');
var sinon = require('sinon');
var Deferred = require('es2015-deferred');
var runner = require('../');

describe('toisu-middleware-runner', function () {
  var sandbox = sinon.sandbox.create();

  var req;
  var res;
  var deferreds;
  var middlewares;

  function makeFakeMiddleware(deferred) {
    return sandbox.stub().returns(deferred.promise);
  }

  beforeEach(function () {
    req = {};
    res = {writable: true};

    deferreds = [new Deferred(), new Deferred()];
    middlewares = deferreds.map(makeFakeMiddleware);
  });

  it('is a function', function () {
    assert.equal(typeof runner, 'function');
  });

  it('returns a resolved promise when no middlewares are passed to it', function () {
    return runner(req, res);
  });

  it('runs middlewares in sequence', function () {
    runner(req, res, middlewares);

    assert.equal(middlewares[0].callCount, 0);
    assert.equal(middlewares[1].callCount, 0);

    return Promise.resolve()
      .then(function () {
        assert.equal(middlewares[0].callCount, 1);
        assert.equal(middlewares[1].callCount, 0);

        deferreds[0].resolve();

        return deferreds[0].promise
          .then(function () {
            assert.equal(middlewares[1].callCount, 1);
          });
      });
  });

  it('resolves only after all middlewares have resolved', function (done) {
    var allResolved = false;

    Promise.all(deferreds).then(function () {
      allResolved = true;
    });

    runner(req, res, middlewares)
      .then(function () {
        assert.ok(allResolved);
        done();
      });

    deferreds.forEach(function (deferred) {
      deferred.resolve();
    });
  });

  it('passes the request and response objects to each middleware', function () {
    deferreds.forEach(function (deferred) {
      deferred.resolve();
    });

    return runner(req, res, middlewares)
      .then(function () {
        assert.equal(middlewares[0].args[0][0], req);
        assert.equal(middlewares[0].args[0][1], res);
        assert.equal(middlewares[1].args[0][0], req);
        assert.equal(middlewares[1].args[0][1], res);
      });
  });

  it('passes the context to each middleware', function () {
    var testContext = {};

    deferreds.forEach(function (deferred) {
      deferred.resolve();
    });

    return runner.call(testContext, req, res, middlewares)
      .then(function () {
        assert.equal(middlewares[0].firstCall.thisValue, testContext);
        assert.equal(middlewares[0].firstCall.thisValue, testContext);
        assert.equal(middlewares[1].firstCall.thisValue, testContext);
        assert.equal(middlewares[1].firstCall.thisValue, testContext);
      });
  });

  it('wraps middlewares which do not return promises', function () {
    middlewares[0].returns();
    deferreds[1].resolve();

    return runner(req, res, middlewares);
  });

  it('resolves asynchronously', function () {
    middlewares[0].returns();
    middlewares[1].returns();

    var doneStub = sandbox.stub();

    runner(req, res, middlewares).then(doneStub);

    assert.equal(doneStub.callCount, 0);
  });

  it('rejects when the first middleware throws', function () {
    var err = new Error();

    middlewares[0].throws(err);

    return runner(req, res, middlewares)
      .then(
        function () {
          throw new Error('Runner should reject.');
        },
        function (err) {
          assert.equal(err, err);
        }
      );
  });
});
