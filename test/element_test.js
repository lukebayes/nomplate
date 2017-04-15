const Element = require('../').Element;
const assert = require('chai').assert;
const createWindow = require('../test_helper').createWindow;
const dom = require('../').dom;
const renderElement = require('../').renderElement;

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
      doc = createWindow().document;
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
      function completeHandler() {
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

      const element = renderElement(render(completeHandler), doc);
      const button = element.firstChild;
      button.click();
      button.click();
      button.click();
    });
  });
});
