const assert = require('chai').assert;
const dom = require('../').dom;
const renderString = require('../').renderString;

describe('Nomplate renderer dom', () => {
  let tree;
  let render;

  beforeEach(() => {
    render = renderString();
    tree = dom.ul({className: 'abcd'}, () => {
      dom.li({className: 'efgh'}, 'ijkl');
    });
  });

  it('creates an ugly html string', () => {
    const str = render(tree);
    assert.equal(str, '<ul class="abcd"><li class="efgh">ijkl</li></ul>');
  });

  it('creates a pretty html string', () => {
    const elem = dom.div({id: 'abcd'}, () => {
      dom.div({id: 'efgh'}, () => {
        dom.ul(() => {
          dom.li('one');
          dom.li('two');
          dom.li('three');
        });
      });
    });
    const str = render(elem, true);
    assert.equal(str, '<div id="abcd">\n  <div id="efgh">\n    <ul>\n      <li>one</li>\n      <li>two</li>\n      <li>three</li>\n    </ul>\n  </div>\n</div>\n');
  });

  it('collapses br', () => {
    const str = render(dom.br());
    assert.equal(str, '<br />');
  });

  it('collapses img', () => {
    const str = render(dom.img({src: '/abcd.png'}));
    assert.equal(str, '<img src="/abcd.png" />');
  });

  it('collapses hr', () => {
    const str = render(dom.hr());
    assert.equal(str, '<hr />');
  });

  it('does not collapse div', () => {
    const str = render(dom.div());
    assert.equal(str, '<div></div>');
  });

  it('writes html string to a stream', () => {
    const parts = [];
    const fakeStream = {
      write(message) {
        parts.push(message);
      },
    };

    render(tree, false, fakeStream);
    assert.equal(parts.length, 11);
    assert.equal(parts.join(''), '<ul class="abcd"><li class="efgh">ijkl</li></ul>');
  });

  it('escapes text content', () => {
    const elem = dom.div({className: '<', style: '>'}, '<script>');
    assert.equal(render(elem), '<div class="&lt;" style="&gt;">&lt;script&gt;</div>');
  });

  it('omits false attrs', () => {
    const result = render(dom.input({type: 'checkbox', checked: false}));
    assert.equal(result, '<input type="checkbox"></input>');
  });
});
