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
    assert.equal(parts.join(''), '<ul class="abcd"><li class="efgh">ijkl</li></ul>');
  });

  it('escapes text content', () => {
    const elem = dom.div({className: '<', style: '>'}, '<script>');
    assert.equal(render(elem), '<div class="&lt;" style="&gt;">&lt;script&gt;</div>');
  });

  it('does not escape unsafe textContent', () => {
    const elem = dom.div(dom.unsafe('<script>'));
    assert.equal(render(elem), '<div><script></div>');
  });

  it('does not escape unsafe attribute values', () => {
    const elem = dom.div({className: dom.unsafe('<script>'), id: dom.unsafe('<script>'), dataFoo: '<script>'});
    assert.equal(render(elem), '<div class="<script>" id="<script>" data-foo="&lt;script&gt;"></div>');
  });

  it('does not escape unsafe marked style content', () => {
    const elem = dom.style(dom.unsafe('body > .foo { }'));
    assert.equal(render(elem), '<style>body > .foo { }</style>');
  });

  it('accepts inline style declarations', () => {
    const style = {
      color: '#fc0',
    };
    const elem = dom.div({style: style});
    assert.equal(render(elem), '<div style="color:#fc0;"></div>');
  });

  it('handls null text content', () => {
    const elem = dom.div({className: 'abcd'}, null);
    assert.equal(render(elem), '<div class="abcd"></div>');
  });

  it('omits false attrs', () => {
    const result = render(dom.input({type: 'checkbox', checked: false}));
    assert.equal(result, '<input type="checkbox"></input>');
  });

  it('omits null attrs', () => {
    const result = render(dom.div({className: 'abcd', dataFooBar: null}));
    assert.equal(result, '<div class="abcd"></div>');
  });

  it('transforms data attr keys', () => {
    const result = render(dom.div({dataFooBar: true}));
    assert.equal(result, '<div data-foo-bar="true"></div>');
  });

  it('omits key attribute', () => {
    const result = render(dom.div({className: 'abcd', key: '1234'}));
    assert.equal(result, '<div class="abcd" data-nom-key="1234"></div>');
  });

  it('does not add unused whitespace, when attrs are ignored', () => {
    const result = render(dom.div({key: false, className: null, dataFooBar: undefined}));
    assert.equal(result, '<div></div>');
  });
});
