# toisu-static

A tiny wrapper around serve-static for Toisu!

This module accepts the same arguments as
[serve-static](https://github.com/expressjs/serve-static).

## Example

```javascript
import http from 'http';
import Toisu from '@toisu/toisu';
import serveStatic from '@toisu/static';

const app = new Toisu();

// Serve the "public" directory (relative to the app root).
app.use(serveStatic('public'));

http.createServer(app.requestHandler).listen(3000);
```
