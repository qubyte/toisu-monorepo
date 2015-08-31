# Toisu! router

The Toisu! router provides routing logic, using routing string like those of Express.

## Usage

Internally the Toisu! router uses [path-to-regexp](https://www.npmjs.com/package/path-to-regexp). When constructing router objects, the options parameter is passed along to `path-to-regexp`. See that package for what forms the strings can take (this should be familiar to express users).

```javascript
const router = new ToisuRouter(options);

router.add('get', '/some/resource/:id', middleware1, middleware2);

app.use(router.middleware);
```

Middleware functions are added as parameters, and not in an array.

Parameters distilled from a path are stored on the `'params'` field of the context Map. i.e.

```javascript
function middleware1(req, res) {
  var params = this.get('params');

  // etc.
}
```

Routed middleware functions are in every other respect the same as unrouted middleware functions, and receive the same context.
