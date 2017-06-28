'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

const parseGenericStub = sinon.stub().returns('parse-generic-return-value');
const toisuBody = SandboxedModule.require('../', {
  requires: {
    './lib/parseGeneric': parseGenericStub,
    body: 'text-body',
    'body/json': 'json-body',
    'body/form': 'form-body',
    'body/any': 'any-body'
  }
});

describe('toisuBody', () => {
  afterEach(() => {
    parseGenericStub.reset();
  });

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

    it('the returned function passes req, res, options, the textBody function and the context', () => {
      const middleware = toisuBody.text('options');

      middleware.call('the-context', 'req', 'res');

      assert.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      assert.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'text-body', 'the-context']);
    });
  });

  describe('the json method', () => {
    it('returns a function', () => {
      assert.equal(typeof toisuBody.json('options'), 'function', 'is a function');
    });

    it('the returned function passes req, res, options, the jsonBody function and the context to parseGeneric', () => {
      const middleware = toisuBody.json('options');

      middleware.call('the-context', 'req', 'res');

      assert.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      assert.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'json-body', 'the-context']);
    });
  });

  describe('the form method', () => {
    it('returns a function', () => {
      assert.equal(typeof toisuBody.form('options'), 'function', 'is a function');
    });

    it('the returned function passes req, res, options, the formBody function and the context to parseGeneric', () => {
      const middleware = toisuBody.form('options');

      middleware.call('the-context', 'req', 'res');

      assert.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      assert.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'form-body', 'the-context']);
    });
  });

  describe('the any method', () => {
    it('returns a function', () => {
      assert.equal(typeof toisuBody.any('options'), 'function', 'is a function');
    });

    it('the returned function passes req, res, options, the anyBody function and the context to parseGeneric', () => {
      const middleware = toisuBody.any('options');

      middleware.call('the-context', 'req', 'res');

      assert.equal(parseGenericStub.callCount, 1, 'calls parseGeneric once');
      assert.deepEqual(parseGenericStub.args[0], ['req', 'res', 'options', 'any-body', 'the-context']);
    });
  });
});
