'use strict';

const assert = require('assert');
const sinon = require('sinon');
const supertest = require('supertest');
const Toisu = require('toisu');
const Router = require('../');

describe('an app with a router', () => {
  const sandbox = sinon.createSandbox();

  let app;
  let getStubs;

  beforeEach(() => {
    app = new Toisu();

    getStubs = [sandbox.stub(), function endWare(req, res) {
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

  it('responds with 404 when a route does not match', done => {
    supertest(app.requestHandler)
      .get('/some/route')
      .expect(404, done);
  });

  it('responds with 405 when a route matches but the method used does not', done => {
    supertest(app.requestHandler)
      .post('/test/route/123')
      .expect(405, done);
  });

  it('adds an Allowed header with implemented methods when a route matches but the method used does not', done => {
    supertest(app.requestHandler)
      .delete('/test/route/123')
      .expect('Allow', 'GET, PUT', done);
  });

  it('calls middlewares for matching routes and methods', done => {
    supertest(app.requestHandler)
      .get('/test/route/123')
      .expect(204)
      .end(() => {
        assert.equal(getStubs[0].callCount, 1);
        done();
      });
  });

  it('makes params available on the context', done => {
    supertest(app.requestHandler)
      .get('/test/route/123')
      .end(() => {
        assert.deepEqual(getStubs[0].thisValues[0].get('params'), { someParam: '123' });
        done();
      });
  });
});
