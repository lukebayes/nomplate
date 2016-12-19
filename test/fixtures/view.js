const dom = require('../../').dom;

function view(options) {
  return dom.div(() => {
    dom.h1('hello world: ' + options.foo);
    dom.div('from inside');
  });
}

module.exports = view;

