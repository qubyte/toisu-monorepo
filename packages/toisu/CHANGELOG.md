# Changelog

## v6.0.0

- The lowest supported version of Node is now 18.
- The default error handler now looks for a `statusCode` property on the error
  it receives, and uses it to set the status code of the response. Many third
  party modules (and first party wrappers like the Toisu! static module) produce
  such errors.
- Not-found handling can now be customized by setting a `handleNotFound`
  property on Toisu! objects.

## v5.0.0

- The lowest supported version of Node is now 16.

## 4.0.1

- Lowest supported version of node is now 14.
- This library is an ES module and must be imported accordingly.
- This module has been moved to the toisu scope as `@toisu/toisu`.

## 3.0.0

Returns the proper 500 status code from the default error handler.

## 2.2.0

Return `app` from `app.use` for chaining.

## 2.0.0

Toisu now makes use of some features only available in Node 4 and above. It is otherwise functionally identical.
