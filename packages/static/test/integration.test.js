'use strict';

const fs = require('fs');
const assert = require('assert');
const Toisu = require('toisu');
const { createServer } = require('http');
const serveStatic = require('..');
const fetch = require('node-fetch');
const { join } = require('path');
const readme = fs.readFileSync(join(__dirname, '..', 'README.md'), 'utf8').trim();

describe('integration', () => {
  let server;

  before(done => {
    const app = new Toisu();

    app.use(serveStatic('.'));

    server = createServer(app.requestHandler, 3000).listen(3000, () => done());
  });

  after(() => {
    server.close();
  });

  it('serves files', async () => {
    const res = await fetch('http://localhost:3000/README.md');
    const text = await res.text();

    assert.ok(readme.length > 0);
    assert.equal(readme.trim(), text.trim());
  });
});
