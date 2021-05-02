## v3.1.0

The runner function now returns true when `res.headersSent` is true or
`res.writable` is false. This allows the caller to know the status of the
response object after the runner has done its job.

## v3.0.3

- This module is now an ES module and must be imported accordingly.
- This module has been moved to the toisu scope: `@toisu/middleware-runner`.
- The lowest supported version of Node is now 14.

## v2.0.0

The v1 line was ES5 + promises compatible. With Node.js v7.6 ES2017 async-await
is now enabled by default. This release updates and greatly simplifies the code
through the use of async-await.

## v1.0.0

Initial release.
