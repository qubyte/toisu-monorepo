# Toisu! router

The Toisu! router provides routing logic, using routing string like those of Express.

## Usage

Internally the Toisu! router uses [path-to-regexp](https://www.npmjs.com/package/path-to-regexp).
When constructing router objects, the options parameter is passed along to `path-to-regexp`. See
that package for what forms the strings can take (this should be familiar to express users).

```javascript
const router = new ToisuRouter(options);

router.route('/some/resource/:id', {
  get: [middleware1, middleware2],
  post: [middleware3]
});

app.use(router.middleware);
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
