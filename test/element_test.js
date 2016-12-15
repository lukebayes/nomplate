import {assert} from 'chai';
import {jsdom} from 'jsdom';

import {Element, dom, renderElement} from '../';

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

  describe('updates', () => {
    let document;

    beforeEach(() => {
      document = jsdom('<body></body>');
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
      }), document);
    });

    it.skip('renders multiple times', () => {
      const element = renderElement(render(), document);
      element.firstChild.click();
      element.firstChild.click();
      element.firstChild.click();
      assert.equal(element.outerHTML, '<ul><button data-nomhandlers="onclick">add</button>' +
        '<li>item-0</li>' +
        '<li>item-1</li>' +
        '<li>item-2</li>' +
      '</ul>');
    });
  });
});
