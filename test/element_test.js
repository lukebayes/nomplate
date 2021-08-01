const Element = require('../').Element;
const assert = require('chai').assert;
const createDocument  = require('../test_helper').createDocument ;
const dom = require('../').dom;
const renderElement = require('../').renderElement;
const renderString = require('../test_helper').renderString;

describe('Nomplate Element', () => {
  let instance;

  beforeEach(() => {
    instance = new Element();
  });

  it('is instantiable', () => {
    assert(instance);
  });

  it('accepts nodeName, attrs and textContent', () => {
    instance = new Element('div', {
      attrs: {className: 'abcd'},
      inlineTextChild: 'efgh',
    });

    assert.equal(instance.nodeName, 'div');
    assert.equal(instance.attrs.className, 'abcd');
    assert.equal(instance.textContent, 'efgh');
  });

  describe('firstChild', () => {
    it('returns null for no children', () => {
      instance = new Element();
      assert.isNull(instance.firstChild);
    });

    it('returns the first child', () => {
      instance = new Element('root');
      instance.childNodes.push(new Element('abcd'));
      instance.childNodes.push(new Element('efgh'));
      instance.childNodes.push(new Element('ijkl'));
      assert.equal(instance.firstChild.nodeName, 'abcd');
    });
  });

  describe('updates', () => {
    let doc;

    beforeEach(() => {
      doc = createDocument();
    });

    function render(onComplete) {
      let incr = 0;
      const labels = [];

      return dom.ul((update) => {
        function onClick() {
          labels.push(`item-${incr += 1}`);
          update(onComplete);
        }

        dom.button({onclick: onClick}, 'add');
        labels.forEach((label) => {
          dom.li(label);
        });
      });
    }

    it('renders second time', () => {
      const element = renderElement(render(() => {
        assert.equal(element.outerHTML, '<ul><button data-nomhandlers="onclick">add</button></ul>');
        element.firstChild.click();
        assert.equal(element.outerHTML, '<ul><button data-nomhandlers="onclick">add</button><li>item-0</li></ul>');
      }), doc);
    });

    it('renders multiple times', (done) => {
      // Wait for async render.
      let callCount = 0;
      function completeHandler() {
        if (callCount++ === 2) {
          try {
            assert.equal(element.outerHTML, '<ul><button data-nomhandlers="onclick">add</button>' +
              '<li>item-1</li>' +
              '<li>item-2</li>' +
              '<li>item-3</li>' +
            '</ul>');
            done();
          } catch(err) {
            done(err);
          }
        }
      }

      const element = renderElement(render(completeHandler), doc);
      const button = element.firstChild;
      button.click();
      button.click();
      button.click();
    });
  });

  describe('selectors', () => {
    it('accepts regular selector', () => {
      const style = dom.style(() => {
        dom.selector('foo', {
          backgroundColor: '#fc0',
        });
      });

      assert.equal(style.renderSelectors(), 'foo{background-color:#fc0;}');
    });

    it('accepts keyframes selector', () => {
      const style = dom.style(() => {
        dom.keyframes('foo', {
          from: {
            opacity: 0,
            backgroundColor: 'red',
          },
          to: {
            opacity: 1,
            backgroundColor: 'yellow',
          },
        });
      });
      assert.equal(style.renderSelectors(), '@keyframes foo{from {opacity:0;background-color:red;} to {opacity:1;background-color:yellow;} }');
    });
  });

  describe('inline style object as value', () => {
    it('ignores empty style object', () => {
      const str = renderString(dom.div({style: {}}));
      assert.equal(str, '<div></div>');
    });

    it('ignores empty style with other attrs', () => {
      const str = renderString(dom.div({style: {}, id: 'abcd'}));
      assert.equal(str, '<div id="abcd"></div>');
    });

    it('accepts a style object', () => {
      const myStyle = {
        color: 'blue',
        fontSize: '3em'
      };

      const str = renderString(dom.div({style: myStyle}));
      assert.equal(str, '<div style="color:blue;font-size:3em;"></div>');
    });

    it('does nothing with correctly formatted keys', () => {
      const myStyle = {'font-size': '2em'};
      const str = renderString(dom.div({style: myStyle}));
      assert.equal(str, '<div style="font-size:2em;"></div>');
    });
  });
});

