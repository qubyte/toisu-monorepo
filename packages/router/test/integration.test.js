import { describe, it, beforeEach } from 'node:test';
import { strict as assert } from 'assert';
import sinon from 'sinon';
import supertest from 'supertest';
import Toisu from '@toisu/toisu';
import Router from '@toisu/router';

describe('router', () => {
  const sandbox = sinon.createSandbox();

  let app;
  let getStubs;

  beforeEach(() => {
    app = new Toisu();

    getStubs = [sandbox.stub(), function endWare(_req, res) {
      res.writeHead(204);
      res.end();
    }];

    const router = new Router();

    router.route('/test/route/:someParam', {
      get: getStubs,
      put: []
    });

    app.use(router.middleware);
  });

  it('responds with 404 when a route does not match', async () => {
    const res = await supertest(app.requestHandler).get('/some/route');

    assert.equal(res.statusCode, 404);
  });

  it('responds with 405 when a route matches but the method used does not', async () => {
    const res = await supertest(app.requestHandler).post('/test/route/123');

    assert.equal(res.statusCode, 405);
  });

  it('adds an Allowed header with implemented methods when a route matches but the method used does not', async () => {
    const res = await supertest(app.requestHandler).delete('/test/route/123');

    assert.equal(res.headers.allow, 'GET, PUT');
  });

  it('calls middlewares for matching routes and methods', async () => {
    const res = await supertest(app.requestHandler).get('/test/route/123');

    assert.equal(res.statusCode, 204);
    assert.equal(getStubs[0].callCount, 1);
  });

  it('makes params available on the context', async () => {
    await supertest(app.requestHandler).get('/test/route/123');

    assert.deepEqual(
      getStubs[0].thisValues[0].get('params'),
      Object.assign(Object.create(null), { someParam: '123' })
    );
  });
});
