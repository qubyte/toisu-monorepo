'use strict';

function makeParams(defs, list) {
  var params = Object.create(null);

  for (var i = 0, len = defs.length; i < len; i++) {
    params[defs[i].name] = list[i + 1];
  }

  return params;
}

module.exports = makeParams;
