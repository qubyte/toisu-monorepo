import { promisify } from 'node:util';
import textBody from 'body';
import jsonBody from 'body/json.js';
import formBody from 'body/form.js';
import anyBody from 'body/any.js';

function makeMiddleware(parser) {
  const wrapped = promisify(parser);

  return options => async function (req, res) {
    this.set('body', await wrapped(req, res, options));
  };
}

export const text = makeMiddleware(textBody);
export const json = makeMiddleware(jsonBody);
export const form = makeMiddleware(formBody);
export const any = makeMiddleware(anyBody);
