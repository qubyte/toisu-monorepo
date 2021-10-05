# toisu-timings

The `timings` middleware provides an interface for building a "Server-Timing"
header, which can be used to communicate durations local to the server to a
browser when responding to a request (for example, timing making database
queries etc.) Browsers render this information in the devtools network panel.
See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing

## Usage

```javascript
import { createServer } from 'http';
import { setTimeout } from 'timers/promises';
import Toisu from '@toisu/toisu';
import makeTimings from '@toisu/timings';

const app = new Toisu();

// Serve the "public" directory (relative to the app root).
app.use(makeTimings());
app.use(async function (req, res) {
  const delay = Math.random() * 1000;
  await setTimeout(delay);
  this.timing({ name: 'delay', description: 'a random delay', duration: delay });
  res.writeHead(204).end();
});

createServer(app.requestHandler).listen(3000);
```

## API

Place `app.use(makeTimings());` early in the set of middlewares your application
uses. Any subsequent middlewares will have access to the `this.timing` function.

### `this.timing`

Since `timing` is appended to the toisu request-response context, middlewares
which use it must be _plain_ synchronous or asynchronous functions. In other
words, you must not use an arrow function.

`this.timing` is a function which takes an object with the fields:

| field | required | description |
| ----- | -------- | ----------- |
| name | `true` | The name of the metric. |
| description | `false` | An optional string to describe the metric. Should be short! |
| duration | `false` | An optional number of milliseconds. |

## Limitations

The (optional) description field can be any "[quoted-string]". However, since
the server-timing spec encourages short descriptions (or none at all), the
characters in the description are limited to ascii word characters, the ascii
space character, and horizontal tabs. Other characters are filtered out.

Server timing header values [_could_ be collected into a comma separated list][gather-headers]. In order to avoid complexity and headers too
long for proxy servers to handle, each timing is sent in its own header by this
library.

The server-timings spec allows timings to be appended to the end of a response
as trailing headers. This package does not support trailing headers, but since
timings can be added in any middleware it's anticipated that they'll rarely be
needed. One case in which they might be is when a body is streamed.

[quoted-string]: https://www.rfc-editor.org/rfc/rfc7230.html#section-3.2.6
[gather-headers]: https://www.rfc-editor.org/rfc/rfc7230.html#section-3.2.2
