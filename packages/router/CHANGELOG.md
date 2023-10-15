# History

## v7.0.0

- The lowest supported version of Node is now 18.

## v6.0.0

- This package has been moved to the toisu scope: `@toisu/router`
- Minimum supported version of Node.js is now 14.
- This package is now published as an ES module, and must be imported accordingly.

## v5.0.0

Minimum supported version of Node.js is now 10.
Bumps path-to-regexp to v6.2.0.

## v4.1.0

Bumps path-to-regexp to v2.1.0.

## v4.0.0

Fixes an issue with query parameters breaking URL path matching.

## v3.1.0

Minor version bump of path-to-regexp to v1.5.3.

## v3.0.0

Complete overhaul of the API. The `get` method has been dropped and a `route` method added. The
route method takes an object of HTTP methods as fields and middleware arrays as values. This change
allows middleware arrays to be added for multiple methods at the same time for the same path.
Crucially, it also means that the router knows when a path matches, but there is no middleware array
for the HTTP method used. This knowledge means that the router now responds with a `405` status code
and an `Allow` header with a list of implemented HTTP methods when this happens.

See the [README](./README.md) for more information.
