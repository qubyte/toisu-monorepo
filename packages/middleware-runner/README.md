# Toisu! middleware runner

For Node.js versions less than 14 please use the 2.x line of releases.

Toisu! runs middlewares in sequence, waiting for promises from middlwares to resolve (when promises
are returned) before continuing to the next. This module contains a function which does this
sequential middleware execution. This logic has been placed in its own module since both `toisu` and
`toisu-router` use it. Other modules intended to work with Toisu! might also find it useful.

## usage

Middleware may either be a function which runs synchronously, or one that returns a promise. A
mixture of synchronous and asynchronous functions may be used. Note though, that the runner returns
a promise and will always resolve asynchronously.

With plain old ES2015:
```javascript
import runner from '@toisu/middleware-runner';

// context will be used as the `this` value for middlewares.
runner.call(context, req, res, middlewares)
  .then(() => {
    // Run when either all middlewares have been used, or one called `res.end()`.
  })
  .catch(err => {
    // Run when a middleware threw.
  });
```

With async-await:
```javascript
import runner from '@toisu/middleware-runner';

async function example() {
  try {
    await runner.call(context, req, res, middlwares);
  } catch (e) {
    // Handle errors.
    return;
  }

  // When either all middlewares have been used, or one called `res.end()`.
}
```
