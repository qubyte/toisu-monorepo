import { describe, it } from 'node:test';
import { strict as assert } from 'assert';
import Toisu from '@toisu/toisu';
import makeTimings from '@toisu/timings';
import supertest from 'supertest';

describe('timings', () => {
  it('is a function', () => {
    assert.equal(typeof makeTimings, 'function');
  });

  it('returns a function', () => {
    assert.equal(typeof makeTimings(), 'function');
  });

  it('adds a timing method to this', () => {
    const that = {};

    makeTimings().call(that, {}, {});

    assert.equal(typeof that.timing, 'function');
  });

  describe('timing method on this', () => {
    it('appends simple name metrics', async () => {
      const app = new Toisu()
        .use(makeTimings())
        .use(function (_req, res) {
          this.timing({ name: 'metric-name' });
          res.writeHead(204).end();
        });

      const res = await supertest(app.requestHandler).get('/blarg');

      assert.equal(res.headers['server-timing'], 'metric-name');
    });

    it('appends metrics with values', async () => {
      const app = new Toisu()
        .use(makeTimings())
        .use(function (_req, res) {
          this.timing({ name: 'metric-name', duration: 123 });
          res.writeHead(204).end();
        });

      const res = await supertest(app.requestHandler).get('/blarg');

      assert.equal(res.headers['server-timing'], 'metric-name;dur=123');
    });

    it('appends metrics with descriptions and values', async () => {
      const app = new Toisu()
        .use(makeTimings())
        .use(function (_req, res) {
          this.timing({ name: 'metric-name', description: 'a description', duration: 123 });
          res.writeHead(204).end();
        });

      const res = await supertest(app.requestHandler).get('/blarg');

      assert.equal(res.headers['server-timing'], 'metric-name;desc="a description";dur=123');
    });

    it('appends multiple metrics', async () => {
      const app = new Toisu()
        .use(makeTimings())
        .use(function (_req, res) {
          this.timing({ name: 'metric-name', description: 'a description', duration: 123 });
          this.timing({ name: 'another-name', duration: 456 });
          res.writeHead(204).end();
        });

      const res = await supertest(app.requestHandler).get('/blarg');

      assert.equal(res.headers['server-timing'], 'metric-name;desc="a description";dur=123, another-name;dur=456');
    });

    it('does not append a server-timing header when no metrics are taken', async () => {
      const app = new Toisu()
        .use(makeTimings())
        .use((_req, res) => res.writeHead(204).end());

      const res = await supertest(app.requestHandler).get('/blarg');

      assert.ok(!Object.prototype.hasOwnProperty.call(res.headers, 'server-timing'));
    });

    it('sends metrics individually', async () => {
      const app = new Toisu()
        .use(makeTimings())
        .use(function (_req, res) {
          this.timing({ name: 'metric-name', description: 'a description', duration: 123 });
          this.timing({ name: 'another-name', duration: 456 });
          res.writeHead(204).end();
        });

      const res = await supertest(app.requestHandler).get('/blarg');

      const number = res.res.rawHeaders.reduce((total, val) => val === 'server-timing' ? total + 1 : total, 0);

      assert.equal(number, 2);
    });
  });
});
