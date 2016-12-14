import {assert} from 'chai';

import {dom} from '../';

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
          dom.link({type: 'text/stylesheet', rel: '/abcd.css'});
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
      assert.equal(head.childNodes[1].attrs.type, 'text/stylesheet');
      assert.equal(head.childNodes[1].attrs.rel, '/abcd.css');

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

  describe('text content', () => {
    it.skip('manages nested text content', () => {
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
});
