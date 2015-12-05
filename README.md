# toisu-static

A simple wrapper around serve-static for Toisu!

This module accepts the same arguments as
[serve-static](https://github.com/expressjs/serve-static).

## Example

```javascript
const http = require('http');
const Toisu = require('toisu');
const serveStatic = require('toisu-static');

const app = new Toisu();

// Serve the "public" directory (relative to the app root).
app.use(serveStatic('public'));

server.listen(3000);
```
