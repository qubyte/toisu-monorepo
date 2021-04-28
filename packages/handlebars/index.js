import handlebars from 'handlebars';

export default function (template, opts) {
  if (typeof template !== 'string') {
    throw new Error('@toisu/handlebars takes a template string as a first argument.');
  }

  const render = handlebars.compile(template);
  const options = {
    templateDefaults: {},
    templateDataField: 'templateData',
    contentType: 'text/html',
    encoding: 'utf8',
    ...opts
  };

  return function (_req, res) {
    const dataFromContext = this.get(options.templateDataField) || {};
    const templateData = { ...options.templateDefaults, ...dataFromContext };

    res.setHeader('Content-Type', options.contentType);
    res.end(render(templateData), options.encoding);
  };
}
