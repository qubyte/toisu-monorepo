'use strict';

const assert = require('assert');
const Toisu = require('toisu');
const toisuBody = require('../');
const supertest = require('supertest');

describe('toisuBody', () => {
  it('is an object', () => {
    assert.equal(typeof toisuBody, 'object', 'is an object');
    assert.ok(toisuBody, 'is not null');
  });

  it('has text, json, form, and any methods', () => {
    assert.deepEqual(Object.keys(toisuBody).sort(), ['any', 'form', 'json', 'text'], 'correct property names');
    assert.equal(typeof toisuBody.text, 'function', 'text is a method');
    assert.equal(typeof toisuBody.json, 'function', 'json is a method');
    assert.equal(typeof toisuBody.form, 'function', 'form is a method');
    assert.equal(typeof toisuBody.any, 'function', 'any is a method');
  });

  describe('the text method', () => {
    it('returns a function', () => {
      assert.equal(typeof toisuBody.text('options'), 'function', 'is a function');
    });

    it('uses the text parser', () => {
      const app = new Toisu()
        .use(toisuBody.text({}))
        .use(function (_req, res) {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(this.get('body'));
        });

      const server = supertest(app.requestHandler);

      return server
        .post('/')
        .send('This is some text.')
        .expect(200)
        .expect('Content-Type', 'text/plain')
        .expect('This is some text.');
    });
  });

  describe('the json method', () => {
    it('returns a function', () => {
      assert.equal(typeof toisuBody.json('options'), 'function', 'is a function');
    });

    it('uses the json parser', () => {
      const app = new Toisu()
        .use(toisuBody.json({}))
        .use(function (_req, res) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(this.get('body')));
        });

      const server = supertest(app.requestHandler);

      return server
        .post('/')
        .send('{"some":"json"}')
        .expect('Content-Type', 'application/json')
        .expect(200, { some: 'json' });
    });
  });

  describe('the form method', () => {
    it('returns a function', () => {
      assert.equal(typeof toisuBody.form('options'), 'function', 'is a function');
    });

    it('uses the form parser', () => {
      const app = new Toisu()
        .use(toisuBody.form({}))
        .use(function (_req, res) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(this.get('body')));
        });

      const server = supertest(app.requestHandler);

      return server
        .post('/')
        .send('this=is&a=form')
        .expect('Content-Type', 'application/json')
        .expect(200, { this: 'is', a: 'form' });
    });
  });

  describe('the any method', () => {
    it('returns a function', () => {
      assert.equal(typeof toisuBody.any('options'), 'function', 'is a function');
    });

    it('uses the json parser for json', () => {
      const app = new Toisu()
        .use(toisuBody.any({}))
        .use(function (_req, res) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(this.get('body')));
        });

      const server = supertest(app.requestHandler);

      return server
        .post('/')
        .send({ some: 'json' })
        .expect('Content-Type', 'application/json')
        .expect(200, { some: 'json' });
    });

    it('uses the form parser for form-encoded bodies', () => {
      const app = new Toisu()
        .use(toisuBody.any({}))
        .use(function (_req, res) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(this.get('body')));
        });

      const server = supertest(app.requestHandler);

      return server
        .post('/')
        .send('this=is&a=form')
        .expect('Content-Type', 'application/json')
        .expect(200, { this: 'is', a: 'form' });
    });
  });
});
