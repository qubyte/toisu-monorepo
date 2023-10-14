import runner from '@toisu/middleware-runner';

export default class Toisu {
  #stack = [];

  handleError = Toisu.defaultHandleError;

  handleNotFound = Toisu.defaultHandleNotFound;

  use(middleware) {
    this.#stack.push(middleware);
    return this;
  }

  get requestHandler() {
    return async (req, res) => {
      const context = new Map();

      try {
        await runner.call(context, req, res, this.#stack);

        if (!res.headersSent) {
          this.handleNotFound.call(context, req, res);
        }
      } catch (error) {
        this.handleError.call(context, req, res, error);
      }
    };
  }

  static defaultHandleNotFound(_req, res) {
    res.statusCode = 404;
    res.end();
  }

  static defaultHandleError(_req, res, error) {
    res.statusCode = error.statusCode || 500;
    res.end();
  }
}
