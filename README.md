# Toisu! middleware runner

Toisu runs middlewares in sequence, waiting for promises from middlwares to resolve before
continuing to the next. It's function shared by Toisu! and the Toisu! router, but alternative
routers and other modules may find it useful.

## usage

Middleware may either be a function which runs synchronously, or one that returns a promise. A
mixture of synchronous and asynchronous functions may be used. Note though, that the runner returns
a promise and will always resolve asynchronously.

With plain old ES2015:
```javascript
const runner = require('toisu-middleware-runner');

// context will be used as the `this` value for middlewares.
runner.call(context, req, res, middlewares)
  .then(function () {
    // Run when either all middlewares have been used, or one called `res.end()`.
  })
  .catch(function (err) {
    // Run when a middleware threw.
  });
```

With async-await:
```javascript
const runner = require('toisu-middleware-runner');

async function example() {
  try {
    await runner.call(context, req, res, middlwares);
  } catch (e) {
    // Handle errors.
    return
  }

  // When either all middlewares have been used, or one called `res.end()`.
}
```
