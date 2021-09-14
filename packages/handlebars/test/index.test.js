import { strict as assert } from 'assert';
import supertest from 'supertest';
import Toisu from '@toisu/toisu';
import handlebars from '@toisu/handlebars';

describe.only('handlebars', () => {
  it('is a function', () => {
    assert.equal(typeof handlebars, 'function');
  });

  it('throws an error when not given a string', () => {
    assert.throws(
      () => handlebars(),
      new Error('@toisu/handlebars takes a template string as a first argument.')
    );
  });

  describe('middleware', () => {
    it('renders a content-type of text/html by default', async () => {
      const app = new Toisu()
        .use(handlebars('<h1>Hello, world!</h1>'));

      const res = await supertest(app.requestHandler).get('/');

      assert.equal(res.statusCode, 200);
      assert.equal(res.text, '<h1>Hello, world!</h1>');
      assert.equal(res.headers['content-type'], 'text/html');
    });

    it('renders a custom content-type when specified', async () => {
      const app = new Toisu()
        .use(handlebars('"Hello, world!"', { contentType: 'application/json' }));

      const res = await supertest(app.requestHandler).get('/');

      assert.equal(res.statusCode, 200);
      assert.equal(res.text, '"Hello, world!"');
      assert.equal(res.headers['content-type'], 'application/json');
    });

    it('draws data from the "templateData" context field by default', async () => {
      const app = new Toisu()
        .use(function () {
          this.set('templateData', { message: 'Hello, world!' });
        })
        .use(handlebars('<h1>{{message}}</h1>'));

      const res = await supertest(app.requestHandler).get('/');

      assert.equal(res.statusCode, 200);
      assert.equal(res.text, '<h1>Hello, world!</h1>');
      assert.equal(res.headers['content-type'], 'text/html');
    });

    it('draws data from a custom field of the context when specified', async () => {
      const app = new Toisu()
        .use(function () {
          this.set('custom', { message: 'Hello, world!' });
        })
        .use(handlebars('<h1>{{message}}</h1>', { templateDataField: 'custom' }));

      const res = await supertest(app.requestHandler).get('/');

      assert.equal(res.statusCode, 200);
      assert.equal(res.text, '<h1>Hello, world!</h1>');
      assert.equal(res.headers['content-type'], 'text/html');
    });

    it('draws data from given defaults when specified', async () => {
      const app = new Toisu()
        .use(handlebars('<h1>{{message}}</h1>', { templateDefaults: { message: 'Hello!' } }));

      const res = await supertest(app.requestHandler).get('/');

      assert.equal(res.statusCode, 200);
      assert.equal(res.text, '<h1>Hello!</h1>');
      assert.equal(res.headers['content-type'], 'text/html');
    });

    it('allows data from the context to override default data', async () => {
      const app = new Toisu()
        .use(function () {
          this.set('templateData', { message: 'World!' });
        })
        .use(handlebars('<h1>{{message}}</h1>', { templateDefaults: { message: 'Hello!' } }));

      const res = await supertest(app.requestHandler).get('/');

      assert.equal(res.statusCode, 200);
      assert.equal(res.text, '<h1>World!</h1>');
      assert.equal(res.headers['content-type'], 'text/html');
    });
  });
});
