const dom = require('../../../').dom; // require('nomplate').dom;

/**
 * This is the default outer page template.
 *
 * You can decide where to render partials by calling the provided 'renderParial' handler.
 */
function main(options, renderPartial) {
  return dom.html(() => {
    dom.head(() => {
      dom.title(options.title || 'Example');
    });

    dom.body(() => {
      dom.h1('This is the outer layout');
      dom.div(() => {
        dom.a({href: '/'}, 'Home');
        dom.a({href: '/about'}, 'About');
      });
      dom.div({className: 'content'}, () => {
        dom.div('Template options.message: ' + options.message);

        dom.div('View goes below!');
        // Render the requested partial.
        renderPartial();
      });
    });
  });
}

module.exports = main;
