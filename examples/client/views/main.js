const dom = require('../../../').dom;

function main(options, renderView) {
  return dom.html(() => {
    dom.head(() => {
      dom.title('Client Example');
      dom.script({src: '/client-bundle.js'});
    });
    dom.body(() => {
      dom.div({id: 'message', style: 'hidden', 'data-message': options.message});
      dom.div({id: 'context'}, () => {
        renderView();
      });
    });
  });
}

module.exports = main;

