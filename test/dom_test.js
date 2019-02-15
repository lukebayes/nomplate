const assert = require('chai').assert;
const dom = require('../').dom;
const renderString = require('../test_helper').renderString;

describe('Nomplate dom', () => {
  describe('basics', () => {
    it('creates an html element', () => {
      const html = dom.html();
      assert.equal(html.nodeName, 'html');
    });

    it('dom structure', () => {
      const html = dom.html(() => {
        dom.head(() => {
          dom.script({src: '/abcd.js'});
          dom.link({type: 'text/css', rel: 'stylesheet', href: '/abcd.css'});
        });

        dom.body(() => {
          dom.h1('Hello World');
          dom.ul(() => {
            dom.li('one');
            dom.li('two');
            dom.li('three');
          });
        });
      });

      assert.equal(html.nodeName, 'html');
      const head = html.childNodes[0];
      assert.equal(head.nodeName, 'head');
      assert.equal(head.childNodes[0].nodeName, 'script');
      assert.equal(head.childNodes[0].attrs.src, '/abcd.js');
      assert.equal(head.childNodes[1].nodeName, 'link');
      assert.equal(head.childNodes[1].attrs.type, 'text/css');
      assert.equal(head.childNodes[1].attrs.href, '/abcd.css');
      assert.equal(head.childNodes[1].attrs.rel, 'stylesheet');

      const body = html.childNodes[1];
      assert.equal(body.childNodes[0].nodeName, 'h1');

      const ul = body.childNodes[1];
      assert.equal(ul.nodeName, 'ul');
      assert.equal(ul.childNodes[0].nodeName, 'li');
      assert.equal(ul.childNodes[1].nodeName, 'li');
      assert.equal(ul.childNodes[2].nodeName, 'li');

      assert.equal(ul.childNodes[0].textContent, 'one');
      assert.equal(ul.childNodes[1].textContent, 'two');
      assert.equal(ul.childNodes[2].textContent, 'three');
    });
  });

  describe('stylesheet helper', () => {
    it('creates a link element', () => {
      const html = dom.html(() => {
        dom.head(() => {
          dom.stylesheet('/abcd.css');
        });
      });

      const link = html.firstChild.firstChild;
      assert(link);
      assert.equal(link.nodeName, 'link');
      assert.equal(link.attrs.type, 'text/css');
      assert.equal(link.attrs.href, '/abcd.css');
    });
  });

  describe('text content', () => {
    it('manages nested text content', () => {
      const para = dom.p(() => {
        dom.text('hello ');
        dom.b('world');
        dom.text(' again');
      });

      assert.equal(para.textContent, 'hello world again');
    });
  });

  describe('components', () => {
    function listItem(label) {
      return dom.li({className: label}, `Label: ${label}`);
    }

    function list(name, childCount) {
      return dom.ul({className: name}, () => {
        for (let i = 0; i < childCount; i += 1) {
          listItem(`item-${i}`, i);
        }
      });
    }

    it('can be nested', () => {
      const collection = list('mine', 3);
      assert.equal(collection.childNodes.length, 3);
      assert.equal(collection.childNodes[2].nodeName, 'li');
      assert.equal(collection.childNodes[2].attrs.className, 'item-2');
      assert.equal(collection.childNodes[2].textContent, 'Label: item-2');
    });
  });

  describe('selector', () => {
    it('accepts selector definitions', () => {
      const elem = dom.div(() => {
        dom.style(() => {
          dom.selector('.foo', {
            color: '#fc0',
            fontSize: '3em'
          });
          dom.selector('.bar', {
            backgroundColor: '#f00',
            fontFamily: 'Arial'
          });
        });
        dom.div({className: 'foo'});
        dom.div({className: 'bar'});
      });

      const styleNode = elem.firstChild;
      assert.equal(styleNode.nodeName, 'style');
      const selectors = styleNode.selectors;
      assert.equal(selectors[0].selector, '.foo');
      assert.equal(selectors[1].selector, '.bar');

      const str = renderString(elem);
      assert.equal(str, '<div><style>.foo{color:#fc0;font-size:3em;}.bar{background-color:#f00;font-family:Arial;}</style><div class="foo"></div><div class="bar"></div></div>');
    });
  });
});

