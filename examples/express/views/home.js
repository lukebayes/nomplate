const dom = require('../../../').dom; // require('nomplate').dom;

function app(options) {
  return dom.div(() => {
    dom.h1('HOME');
    dom.p('View options.message: ' + options.message);
    dom.p(`Option keys: ${Object.keys(options)}`);
  });
}

module.exports = app;

