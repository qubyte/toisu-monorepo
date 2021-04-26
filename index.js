export default async function runner(req, res, middlewares = []) {
  for (const middleware of middlewares) {
    if (res.headersSent) {
      return;
    }

    await middleware.call(this, req, res);
  }
}
