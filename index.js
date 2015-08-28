var handlebars = require('handlebars');
var assign = require('object-assign');

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
  var options = assign({}, defaults, opts || {});

  return function (req, res) {
    var templateData = assign({}, options.templateDefaults, this[options.templateDataField] || {});

    res.setHeader('Content-Type', options.contentType);
    res.end(render(templateData), options.encoding);
  };
};
