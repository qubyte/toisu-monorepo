import { strict as assert } from 'assert';
import sinon from 'sinon';
import Deferred from 'es2015-deferred';
import runner from '@toisu/middleware-runner';

describe('middleware-runner', () => {
  const sandbox = sinon.createSandbox();

  let req;
  let res;
  let deferreds;
  let middlewares;

  beforeEach(() => {
    req = {};
    res = { writable: true };

    deferreds = [new Deferred(), new Deferred()];
    middlewares = deferreds.map(deferred => sandbox.stub().returns(deferred.promise));
  });

  it('is a function', () => {
    assert.equal(typeof runner, 'function');
  });

  it('returns a resolved promise when no middlewares are passed to it', () => {
    return runner(req, res);
  });

  it('runs middlewares in sequence', async () => {
    runner(req, res, middlewares);

    assert.equal(middlewares[0].callCount, 1);
    assert.equal(middlewares[1].callCount, 0);

    await deferreds[0].resolve().then();

    assert.equal(middlewares[1].callCount, 1);
  });

  it('resolves only after all middlewares have resolved', done => {
    let allResolved = false;

    Promise.all(deferreds).then(() => {
      allResolved = true;
    });

    runner(req, res, middlewares)
      .then(() => {
        assert.ok(allResolved);
        done();
      });

    for (const deferred of deferreds) {
      deferred.resolve();
    }
  });

  it('passes the request and response objects to each middleware', async () => {
    for (const deferred of deferreds) {
      deferred.resolve();
    }

    await runner(req, res, middlewares);

    assert.equal(middlewares[0].args[0][0], req);
    assert.equal(middlewares[0].args[0][1], res);
    assert.equal(middlewares[1].args[0][0], req);
    assert.equal(middlewares[1].args[0][1], res);
  });

  it('passes the context to each middleware', async () => {
    const testContext = {};

    for (const deferred of deferreds) {
      deferred.resolve();
    }

    await runner.call(testContext, req, res, middlewares);

    assert.equal(middlewares[0].firstCall.thisValue, testContext);
    assert.equal(middlewares[0].firstCall.thisValue, testContext);
    assert.equal(middlewares[1].firstCall.thisValue, testContext);
    assert.equal(middlewares[1].firstCall.thisValue, testContext);
  });

  it('wraps middlewares which do not return promises', () => {
    middlewares[0].returns();
    deferreds[1].resolve();

    return runner(req, res, middlewares);
  });

  it('resolves asynchronously', () => {
    middlewares[0].returns();
    middlewares[1].returns();

    const doneStub = sandbox.stub();

    runner(req, res, middlewares).then(doneStub);

    assert.equal(doneStub.callCount, 0);
  });

  it('rejects when the first middleware throws', async () => {
    const err = new Error();

    middlewares[0].throws(err);

    try {
      await runner(req, res, middlewares);
    } catch (e) {
      assert.equal(e, err);
      return;
    }

    throw new Error('Runner should reject.');
  });

  it('does not attempt to continue a sequence of middlewares when the response is not writable', async () => {
    middlewares[0].callsFake(() => (res.writable = false));

    await runner(req, res, middlewares);

    assert.ok(middlewares[0].calledOnce);
    assert.ok(middlewares[1].notCalled);
  });

  it('resolves to true when the response is not writable before any middlewares are executed', async () => {
    res.writable = false;

    const result = await runner(req, res, middlewares);

    assert.equal(result, true);
    assert.ok(middlewares[0].notCalled);
    assert.ok(middlewares[1].notCalled);
  });

  it('resolves to true when the response is no longer writable', async () => {
    middlewares[0].callsFake(() => (res.writable = false));

    const result = await runner(req, res, middlewares);

    assert.equal(result, true);
  });

  it('resolves to true when all middlewares are executed and the response is no longer writable', async () => {
    deferreds[0].resolve();
    middlewares[1].callsFake(() => (res.writable = false));

    const result = await runner(req, res, middlewares);

    assert.equal(result, true);
  });

  it('resolves to true when the response headers were sent before any middlewares are executed', async () => {
    res.headersSent = true;

    const result = await runner(req, res, middlewares);

    assert.equal(result, true);
    assert.ok(middlewares[0].notCalled);
    assert.ok(middlewares[1].notCalled);
  });

  it('resolves to true when the response headers are sent', async () => {
    middlewares[0].callsFake(() => (res.headersSent = true));

    const result = await runner(req, res, middlewares);

    assert.equal(result, true);
  });

  it('resolves to true when all middlewares are executed and the response headers are sent', async () => {
    middlewares[0].callsFake(() => (res.headersSent = true));

    const result = await runner(req, res, middlewares);

    assert.equal(result, true);
  });

  it('resolves to false when the respose headers are not sent and the response is still writable', async () => {
    deferreds[0].resolve();
    deferreds[1].resolve();

    const result = await runner(req, res, middlewares);

    assert.equal(result, false);
  });
});
