import fs from 'fs';
import { strict as assert } from 'assert';
import Toisu from '@toisu/toisu';
import serveStatic from '../index.js';
import supertest from 'supertest';

const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8').trim();

assert.notEqual(readme.length, 0);

describe('static', () => {
  it('serves files', async () => {
    const app = new Toisu().use(serveStatic('.'));
    const res = await supertest(app.requestHandler).get('/README.md');

    assert.equal(readme, res.text.trim());
  });

  it('falls through when configured to and no file is found', async () => {
    const app = new Toisu()
      .use(serveStatic('.', { fallthrough: true }))
      .use((_req, res) => res.end('fallthrough'));

    const res = await supertest(app.requestHandler).get('/blarg');

    assert.equal(res.text, 'fallthrough');
  });

  it('does not fall through when not configured to', async () => {
    const app = new Toisu()
      .use(serveStatic('.', { fallthrough: false }))
      .use((_req, res) => res.end('fallthrough'));

    const res = await supertest(app.requestHandler).get('/blarg');

    assert.equal(res.statusCode, 500);
  });
});
