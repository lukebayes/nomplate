const assert = require('chai').assert;
const dom = require('../').dom;
const renderLayout = require('../src/render_layout');

describe('Nomplate express', () => {
  function view() {
    return dom.ul({id: 'abcd'}, () => {
      dom.li('one');
      dom.li('two');
      dom.li('three');
    });
  }

  function layout(options, renderView) {
    return dom.div({id: 'layout'}, () => {
      dom.h1('Layout');
      renderView();
    });
  }

  it('renders simple layout', () => {
    const str = renderLayout(layout, view, null, () => {});
    assert.equal(str, '<div id="layout"><h1>Layout</h1><ul id="abcd"><li>one</li><li>two</li><li>three</li></ul></div>');
  });

  it('renders pretty layout', () => {
    const options = {
      settings: {
        'view options': {
          pretty: true,
        },
      },
    };
    const str = renderLayout(layout, view, options, () => {});
    assert.equal(str, '<div id="layout">\n  <h1>Layout</h1>\n  <ul id="abcd">\n    <li>one</li>\n    <li>two</li>\n    <li>three</li>\n  </ul>\n</div>\n');
  });
});

