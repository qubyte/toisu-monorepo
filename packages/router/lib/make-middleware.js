import runner from '@toisu/middleware-runner';

export default function makeMiddleware(routes) {
  return function routerMiddleware(req, res) {
    for (let i = 0, len = routes.length; i < len; i++) {
      const result = routes[i].match(req);

      if (result) {
        this.set('params', result.params);

        return runner.call(this, req, res, result.middlewares);
      }
    }
  };
}
