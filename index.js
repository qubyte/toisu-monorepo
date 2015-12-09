var handlebars = require('handlebars');

var defaults = {
  templateDefaults: {},
  templateDataField: 'templateData',
  contentType: 'text/html',
  encoding: 'utf8'
};

module.exports = function (template, opts) {
  if (typeof template !== 'string') {
    throw new Error('toisu-handlebars takes a template string as a first argument.');
  }

  var render = handlebars.compile(template);
  var options = Object.assign({}, defaults, opts || {});

  return function (req, res) {
    var dataFromContext = this.get(options.templateDataField) || {};
    var templateData = Object.assign({}, options.templateDefaults, dataFromContext);

    res.setHeader('Content-Type', options.contentType);
    res.end(render(templateData), options.encoding);
  };
};
