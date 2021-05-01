export default async function runner(req, res, middlewares = []) {
  for (const middleware of middlewares) {
    if (res.headersSent || !res.writable) {
      return true;
    }

    await middleware.call(this, req, res);
  }

  return (res.headersSent || !res.writable);
}
