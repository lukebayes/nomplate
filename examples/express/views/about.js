const dom = require('../../../').dom; // require('nomplate').dom;

function app(options) {
  return dom.div(() => {
    dom.h1('ABOUT');
    dom.p('This is the about page');
  });
}

module.exports = app;

