import runner from '@toisu/middleware-runner';

export default class Toisu {
  #stack = [];

  handleError = Toisu.defaultHandleError;

  use(middleware) {
    this.#stack.push(middleware);
    return this;
  }

  get requestHandler() {
    return (req, res) => {
      const context = new Map();

      return runner.call(context, req, res, this.#stack)
        .then(() => {
          if (!res.headersSent) {
            res.statusCode = 404;
            res.end();
          }
        })
        .catch(error => this.handleError.call(context, req, res, error));
    };
  }

  static defaultHandleError(_req, res) {
    res.statusCode = 500;
    res.end();
  }
}
