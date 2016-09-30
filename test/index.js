'use strict';

var assert = require('assert');
var sinon = require('sinon');
var SandboxedModule = require('sandboxed-module');

describe('toisu-handlebars', function () {
  var sandbox = sinon.sandbox.create();

  var toisuHandlebars;
  var compileStub;
  var renderStub;
  var req;
  var res;

  before(function () {
    compileStub = sinon.stub();

    toisuHandlebars = SandboxedModule.require('../', {
      requires: {
        handlebars: {
          compile: compileStub
        }
      }
    });
  });

  beforeEach(function () {
    renderStub = sandbox.stub().returns('rendered-template');

    compileStub.returns(renderStub);

    req = {};

    res = {
      setHeader: sandbox.stub(),
      end: sandbox.stub()
    };
  });

  afterEach(function () {
    compileStub.reset();
  });

  it('is a function', function () {
    assert.equal(typeof toisuHandlebars, 'function');
  });

  it('throws an error when not given a string', function () {
    assert.throws(
      function () {
        toisuHandlebars();
      },
      function (err) {
        return err instanceof Error;
      },
      'toisu-handlebars takes a template string as a first argument.'
    );
  });

  describe('no options', function () {
    var middleware;

    beforeEach(function () {
      middleware = toisuHandlebars('template-string');
    });

    it('returns a function', function () {
      assert.equal(typeof middleware, 'function');
    });

    it('compiles the template', function () {
      assert.equal(compileStub.callCount, 1);
    });

    it('renders a template using the default "templateData" field of the toisu context', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(renderStub.callCount, 1);
      assert.deepEqual(renderStub.args[0], [{ hello: 'world' }]);
    });

    it('renders a template with an empty object if no data is found on the toisu context', function () {
      middleware.call(new Map(), req, res);

      assert.equal(renderStub.callCount, 1);
      assert.deepEqual(renderStub.args[0], [{}]);
    });

    it('sets the Content-Type header to the default "text/html"', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.setHeader.callCount, 1);
      assert.ok(res.setHeader.calledWithExactly('Content-Type', 'text/html'));
    });

    it('calls end with the rendered template and default encoding (utf8)', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.end.callCount, 1);
      assert.ok(res.end.calledWithExactly('rendered-template', 'utf8'));
    });
  });

  describe('templateDataField option', function () {
    var middleware;

    beforeEach(function () {
      middleware = toisuHandlebars('template-string', { templateDataField: 'locals' });
    });

    it('returns a function', function () {
      assert.equal(typeof middleware, 'function');
    });

    it('compiles the template', function () {
      assert.equal(compileStub.callCount, 1);
    });

    it('renders a template using the configured template data field of the toisu context', function () {
      var context = new Map();
      context.set('locals', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(renderStub.callCount, 1);
      assert.deepEqual(renderStub.args[0], [{ hello: 'world' }]);
    });

    it('sets the Content-Type header to the default "text/html"', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.setHeader.callCount, 1);
      assert.ok(res.setHeader.calledWithExactly('Content-Type', 'text/html'));
    });

    it('calls end with the rendered template and default encoding (utf8)', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.end.callCount, 1);
      assert.ok(res.end.calledWithExactly('rendered-template', 'utf8'));
    });
  });

  describe('templateDefaults option', function () {
    var middleware;

    beforeEach(function () {
      middleware = toisuHandlebars('template-string', { templateDefaults: { hello: 'to-be-overwritten', something: 'else' } });
    });

    it('returns a function', function () {
      assert.equal(typeof middleware, 'function');
    });

    it('compiles the template', function () {
      assert.equal(compileStub.callCount, 1);
    });

    it('renders a template using the default "templateData" field of the toisu context, including default data', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(renderStub.callCount, 1);
      assert.deepEqual(renderStub.args[0], [{ hello: 'world', something: 'else' }]);
    });

    it('sets the Content-Type header to the default "text/html"', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.setHeader.callCount, 1);
      assert.ok(res.setHeader.calledWithExactly('Content-Type', 'text/html'));
    });

    it('calls end with the rendered template and default encoding (utf8)', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.end.callCount, 1);
      assert.ok(res.end.calledWithExactly('rendered-template', 'utf8'));
    });
  });

  describe('contentType option', function () {
    var middleware;

    beforeEach(function () {
      middleware = toisuHandlebars('template-string', { contentType: 'application/json' });
    });

    it('returns a function', function () {
      assert.equal(typeof middleware, 'function');
    });

    it('compiles the template', function () {
      assert.equal(compileStub.callCount, 1);
    });

    it('renders a template using the default "templateData" field of the toisu context', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(renderStub.callCount, 1);
      assert.deepEqual(renderStub.args[0], [{ hello: 'world' }]);
    });

    it('sets the Content-Type header to the configured content type', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.setHeader.callCount, 1);
      assert.ok(res.setHeader.calledWithExactly('Content-Type', 'application/json'));
    });

    it('calls end with the rendered template and default encoding (utf8)', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.end.callCount, 1);
      assert.ok(res.end.calledWithExactly('rendered-template', 'utf8'));
    });
  });

  describe('encoding option', function () {
    var middleware;

    beforeEach(function () {
      middleware = toisuHandlebars('template-string', { encoding: 'blah' });
    });

    it('returns a function', function () {
      assert.equal(typeof middleware, 'function');
    });

    it('compiles the template', function () {
      assert.equal(compileStub.callCount, 1);
    });

    it('renders a template using the default "templateData" field of the toisu context', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(renderStub.callCount, 1);
      assert.deepEqual(renderStub.args[0], [{ hello: 'world' }]);
    });

    it('sets the Content-Type header to the default "text/html"', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.setHeader.callCount, 1);
      assert.ok(res.setHeader.calledWithExactly('Content-Type', 'text/html'));
    });

    it('calls end with the rendered template and the configured encoding', function () {
      var context = new Map();
      context.set('templateData', { hello: 'world' });
      middleware.call(context, req, res);

      assert.equal(res.end.callCount, 1);
      assert.ok(res.end.calledWithExactly('rendered-template', 'blah'));
    });
  });
});
