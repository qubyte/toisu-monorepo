import serveStatic from 'serve-static';

export default function makeStaticMiddleware(root, options) {
  const serve = serveStatic(root, options);

  return function staticMiddleware(req, res) {
    return new Promise((resolve, reject) => {
      serve(req, res, err => err ? reject(err) : resolve());
    });
  };
}
