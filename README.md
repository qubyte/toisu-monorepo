# toisu-handlebars

toisu-handlebars is a handlebars wrapper for the TOISU! server micro-framework.

## install

To install toisu-handlebars into your project, use:

```bash
npm install --save toisu-handlebars
```

## usage

```javascript
const http = require('http');
const Toisu = require('toisu');
const toisuHandlebars = require('toisu-handlebars');
const dbModule = require('./a-bd-module');

const template = `
  <!doctype html>
  <html>
  <head><title>Hello, world!</title></head>
  <body>{{bodyContent}}</body>
  </html>
`;

const app = new Toisu();

// Put some template data on the context.
app.use(async function () {
  const bodyContent = await dbModule.get();

  this.templateData = {bodyContent};
});

// toisu handlebars compiles the template and returns a middleware function.
app.use(toisuHandlebars(template));

http.createServer(app.requestHandler).listen(3000);
```
