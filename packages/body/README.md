# toisu-body

[![Greenkeeper badge](https://badges.greenkeeper.io/qubyte/toisu-body.svg)](https://greenkeeper.io/)

Body parsing middleware for Toisu!

This module is a thin wrapper around the excellent
[`body`](https://www.npmjs.com/package/body) module. It appends a `'body'`
field to the context of your request-response chain.

## Example

This server will send back JSON sent to it.

```javascript
const http = require('http');
const Toisu = require('toisu');
const body = require('toisu-body');

const app = new Toisu();

app.use(body.json()); // Note, non-json requests will lead to an error!

app.use(function (req, res) {
  const body = this.get('body');
  const stringified = JSON.stringify(body);

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(stringified)
  });

  res.write(stringified);
  res.end();
});

http.createServer(app.requestHandler).listen(3000);
```

## Handling errors

If clients can send requests which aren't, for example, JSON, then JSON
middleware will reject with an error when it attempts to parse the body. There
are a few solutions to this issue:

 - Handle it in the `errorHandler` property of the `app` object.
 - Use the `text` middleware and parse it by hand.
 - Chain the middleware with a catch.

I recommend the third solution, which looks like:

```javascript
const http = require('http');
const Toisu = require('toisu');
const body = require('toisu-body');

const app = new Toisu();
const json = body.json();

app.use(function (req, res) {
  return json.call(this, req, res).catch(function (err) {
    res.statusCode = 400;
    res.end();
  });
});

app.use(function (req, res) {
  const body = this.get('body');
  const stringified = JSON.stringify(body);

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(stringified)
  });

  res.write(stringified);
  res.end();
});

http.createServer(app.requestHandler).listen(3000);
```

You could go further and check the content type of the request as well, and if
the content type isn't compatible with JSON use a 415 status code.

## API

This module exports four methods. Each takes a single `options` object which is
passed on to the `body` module internally. See the
[documentation for that module](https://github.com/Raynos/body#documentation)
for details on the options available. Each method returns a Toisu! middeware
function.

### `text(options)`

Gets the body from the request as a string, and attempts no parsing on it.
Useful for when you need to do some custom checks or parsing. It appends this
string to the Toisu! request-response context (`this` in middlewares) as
`'body'`.

### `json(options)`

Gets the body from the request and parses it as JSON. It appends this string to
the Toisu! request-response context (`this` in middlewares) as `'body'`.

### `form(options)`

Gets the body from the request and parses it as a form. It appends this string
to the Toisu! request-response context (`this` in middlewares) as `'body'`.

### `any(options)`

Looks at the `Content-Type` header and will parse as either form data or JSON.
If the content type doesn't conform to either, it will throw an error.
