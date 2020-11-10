# Toisu! router

The Toisu! router provides routing logic, using routing string like those of Express.

## Usage

Internally the Toisu! router uses [path-to-regexp](https://www.npmjs.com/package/path-to-regexp).
When adding routes, the options parameter is passed along to `path-to-regexp`. See that package for
what forms the strings can take (this should be familiar to express users).

```javascript
const Toisu = require('toisu');
const Router = require('toisu-router');
const http = require('http');

const app = new Toisu();
const router = new Router();

router.route('/some/resource/:id', {
  get: [middleware1, middleware2],
  post: [middleware3]
});

app.use(router.middleware);

http.createServer(app.requestHandler).listen(3000);
```

The methods for a route are given a list of middleware each. If the router handles a request which
uses a method with no middlewares, then the router will respond with a 405 status code and an
`Accept` header containing a list of methods which the router does have middlewares for.

Parameters distilled from a path are stored on the `'params'` field of the context Map. i.e.

```javascript
function middleware1(req, res) {
  const params = this.get('params');

  // etc.
}
```

Routed middleware functions are in every other respect the same as unrouted middleware functions,
and receive the same context.

## API

### class `Router`

```javascript
const router = new Router();
```

### `router.route(path, handlers, [options])`

The optional `options` object is passed to `path-to-regexp`, which is responsible for parsing the
path string. When a route and HTTP method match, parameters will be parsed from the string into an
object, which is appended to the context map as `this.get('params')`

```javascript
function middleware(req, res) {
  const params = this.get('params');

  console.log(params); // { someData: <determined by req.url> }
}

router.route('/some/test/path/:someData', {
  GET: [middleware]
});
```

### `middleware = router.middleware`

This can be consumed by a Toisu! `app.use` call.

```javascript
const app = new Toisu();

app.use(router.middleware);
```
