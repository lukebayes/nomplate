const assert = require('chai').assert;
const config = require('../').config;
const createWindow = require('../test_helper').createWindow;
const dom = require('../').dom;
const renderElement = require('../').renderElement;
const simulant = require('jsdom-simulant');
const sinon = require('sinon');
const svg = require('../').svg;

describe('Nomplate renderElement', () => {
  let doc;

  beforeEach(() => {
    doc = createWindow().document;
  });

  it('escapes text content', () => {
    const div = dom.div({className: '<', style: '>'}, '<script>');

    const element = renderElement(div, doc);

    assert.equal(element.getAttribute('class'), '&lt;');
    assert.equal(element.getAttribute('style'), '&gt;');
    assert.equal(element.innerHTML, '&lt;script&gt;');

    // NOTE(lbayes): jsdom will double encode these values:
    assert.equal(element.outerHTML, '<div class="&amp;lt;" style="&amp;gt;">&lt;script&gt;</div>');
  });

  it('transfers attributes', () => {
    const div = dom.div({style: 'color:#fc0;', className: 'abcd'});
    const element = renderElement(div, doc);

    assert.equal(element.getAttribute('style'), 'color:#fc0;');
    assert.equal(element.className, 'abcd');
  });

  it('renders text content as child text node', () => {
    const div = dom.div('abcd');
    assert.equal(div.children.length, 0, 'Node children are empty');
    assert.equal(div.childNodes.length, 1, 'Has a text child');
    assert.equal(div.textContent, 'abcd');

    const element = renderElement(div, doc);
    assert.equal(element.outerHTML, '<div>abcd</div>');
    assert.equal(element.childNodes.length, 1);
  });

  it('does not apply existing attribute', () => {
    const div = dom.div({style: 'color:#fc0;', className: 'abcd'});
    const element = doc.createElement('div');
    element.className = 'abcd';
    element.setAttribute('style', 'color:#fc0;');
    sinon.spy(element, 'setAttribute');
    renderElement(div, doc, element);

    assert.equal(element.setAttribute.callCount, 0, 'There should be no assignment');
  });

  it('removes missing attrs', () => {
    const div = dom.div();
    const element = doc.createElement('div');
    element.setAttribute('style', 'color:#fc0;');

    assert.equal(element.outerHTML, '<div style="color:#fc0;"></div>');
    renderElement(div, doc, element);
    assert.equal(element.outerHTML, '<div></div>');
  });

  it('applies on handler', () => {
    const clickHandler = sinon.spy();
    const div = dom.div({onclick: clickHandler});
    const element = renderElement(div, doc);

    element.click();
    assert.equal(clickHandler.callCount, 1);
  });

  it('removes handler', () => {
    const handler = sinon.spy();
    const div = dom.div({onclick: handler, onkeyup: handler, onkeydown: handler});
    const element = renderElement(div, doc);
    const div2 = dom.div({onkeyup: handler});

    renderElement(div2, doc, element);
    element.click();
    assert.equal(element.outerHTML, '<div data-nomhandlers="onkeyup"></div>');
    assert.equal(handler.callCount, 0);
  });

  it('discards false attribute values', () => {
    const checkbox = dom.input({type: 'checkbox', checked: false});
    const element = renderElement(checkbox, doc);

    // NOTE(lbayes): The jsdom library renders checkboxes with no closing tag.
    assert.equal(element.outerHTML, '<input type="checkbox">');
  });

  it('applies multiple text children', () => {
    const p = dom.p(() => {
      dom.text('hello');
      dom.b('world');
      dom.text('another');
    });

    const element = renderElement(p, doc);
    assert.equal(element.outerHTML, '<p>hello<b>world</b>another</p>');
  });

  describe('tree', () => {
    it('creates a single level of depth', () => {
      const root = dom.ul({className: 'list'}, () => {
        dom.li('one');
        dom.li('two');
        dom.li('three');
      });

      const element = renderElement(root, doc);

      assert.equal(element.className, 'list');
      assert.equal(element.childNodes.length, 3);
      const kids = element.childNodes;

      assert.equal(kids[0].textContent, 'one');
      assert.equal(kids[1].textContent, 'two');
      assert.equal(kids[2].textContent, 'three');
    });

    it('creates nested children', () => {
      const root = dom.div({className: 'root'}, () => {
        dom.header({className: 'header'}, () => {
          dom.h1('Hello World');
        });
        dom.section({className: 'main'}, () => {
          dom.ul(() => {
            dom.li('one');
            dom.li('two');
            dom.li('three');
          });
        });
        dom.footer(() => {
          dom.h2('Goodbye World');
        });
      });

      const element = renderElement(root, doc);
      assert.equal(root.className, 'root');

      // Navigate to the first LI component and verify it is where we expect it.
      assert.equal(element.children[1].firstChild.firstChild.textContent, 'one');
    });
  });

  describe('events', () => {
    let button;
    let buttonHandler;
    let root;
    let rootHandler;
    let stopProp;

    beforeEach(() => {
      stopProp = false;
      rootHandler = sinon.spy();
      buttonHandler = sinon.spy((event) => {
        if (stopProp) {
          event.stopPropagation();
        }
      });
      root = renderElement(dom.div({onclick: rootHandler}, () => {
        dom.div(() => {
          dom.div(() => {
            dom.button({id: 'btn', onclick: buttonHandler});
          });
        });
      }), doc);

      button = root.querySelector('#btn');
    });

    it('stopPropagation stops bubbling', () => {
      stopProp = true;
      simulant.fire(button, 'click');
      assert.equal(rootHandler.callCount, 0);
    });

    it('wires up click handler', () => {
      simulant.fire(button, 'click');
      assert.equal(buttonHandler.callCount, 1);
    });

    it('bubbles click events', () => {
      simulant.fire(button, 'click');
      assert.equal(rootHandler.callCount, 1);
    });

    // Uncaught exceptions in DOM Element event listeners are being silently swallowed by JSDOM.
    it.skip('sends keyboard events', () => {
      let didFire = false;
      function handler(event) {
        didFire = true;
        throw new Error('fake-error');
        assert.equal(event.keyCode, 24);
      }

      const element = renderElement(dom.input({onkeyup: handler}), doc);
      simulant.fire(element, 'keyup', {keyCode: 23});
      assert(didFire, 'Handler should have fired');
    });
  });

  describe('updates', () => {
    it('replaces textContent', () => {
      const root = dom.div('hello');
      const element = renderElement(root, doc);
      assert.equal(element.outerHTML, '<div>hello</div>');

      // Update the textContent
      const other = dom.div('world');
      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<div>world</div>');
    });

    it('replaces className', () => {
      const root = dom.div({className: 'abcd'});
      const element = renderElement(root, doc);
      const other = dom.div({className: 'efgh'});

      assert.equal(element.outerHTML, '<div class="abcd"></div>');
      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<div class="efgh"></div>');
    });

    it('removes className', () => {
      const root = dom.div({className: 'abcd'});
      const element = renderElement(root, doc);
      const other = dom.div();

      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<div></div>');
    });

    it('replaces attribute', () => {
      const root = dom.a({href: '/abcd'});
      const element = renderElement(root, doc);
      const other = dom.a({href: '/efgh'});

      assert.equal(element.outerHTML, '<a href="/abcd"></a>');
      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<a href="/efgh"></a>');
    });

    it('removes attribute', () => {
      const root = dom.a({href: '/abcd'});
      const element = renderElement(root, doc);
      const other = dom.a();

      assert.equal(element.outerHTML, '<a href="/abcd"></a>');
      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<a></a>');
    });

    it('replaces handler', () => {
      const handler = sinon.spy();
      const root = dom.div({onclick: handler});
      const element = renderElement(root, doc);
      const other = dom.div();

      assert.equal(element.outerHTML, '<div data-nomhandlers="onclick"></div>');
      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<div></div>');
    });

    it('adds handlers', () => {
      const handler = sinon.spy();
      const root = dom.div({onclick: handler});
      const element = renderElement(root, doc);
      const other = dom.div({onclick: handler, onkeydown: handler});

      assert.equal(element.outerHTML, '<div data-nomhandlers="onclick"></div>');
      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<div data-nomhandlers="onclick onkeydown"></div>');
    });

    it('update handlers', () => {
      const handler = sinon.spy();
      const root = dom.div({onclick: handler});
      const element = renderElement(root, doc);
      const other = dom.div({onkeydown: handler});

      assert.equal(element.outerHTML, '<div data-nomhandlers="onclick"></div>');
      renderElement(other, doc, element);
      assert.equal(element.outerHTML, '<div data-nomhandlers="onkeydown"></div>');
    });

    it('updates a child', () => {
      function renderDocument(labels) {
        return dom.ul(() => {
          labels.forEach((label) => {
            dom.li(label);
          });
        });
      }

      // renderDocument the tree for the first time.
      const element = renderElement(renderDocument(['abcd']), doc);
      assert.equal(element.outerHTML, '<ul><li>abcd</li></ul>');

      // Add a child to the list.
      renderElement(renderDocument(['abcd', 'efgh']), doc, element);
      assert.equal(element.outerHTML, '<ul><li>abcd</li><li>efgh</li></ul>');

      // Add another child to the list.
      renderElement(renderDocument(['abcd', 'efgh', 'ijkl']), doc, element);
      assert.equal(element.outerHTML, '<ul><li>abcd</li><li>efgh</li><li>ijkl</li></ul>');

      // Remove the first child.
      renderElement(renderDocument(['efgh', 'ijkl']), doc, element);
      assert.equal(element.outerHTML, '<ul><li>efgh</li><li>ijkl</li></ul>');

      // Remove all children.
      renderElement(renderDocument([]), doc, element);
      assert.equal(element.outerHTML, '<ul></ul>');
    });

    it('creates svg elements with createElementNS', () => {
      const root = dom.div(() => {
        svg(() => {
          svg.rect({width: 200, height: 100});
        });
      });
      const element = renderElement(root, doc);
      assert.equal(element.outerHTML, '<div><svg><rect width="200" height="100"></rect></svg></div>');
    });

    it('proceeds when onRender handlers fail', (done) => {
      let message;

      // Ensure we log the async error.
      sinon.stub(console, 'error', (_message) => {
        message =_message;
      });

      const one = () => { throw new Error('fake-error'); };
      const two = sinon.spy();

      const root = dom.div(() => {
        dom.div({onRender: one});
        dom.div({onRender: two});
      });

      renderElement(root, doc);

      config().setTimeout(() => {
        try {
          assert.equal(two.callCount, 1);
          assert.match(console.error.getCall(0).args[0], /fake-error/);
          done();
        } catch (err) {
          done(err);
        } finally {
          // Ensure we clean up the console.error stub
          console.error.restore();
        }
      }, 0);
    });

    it('receives the real dom element on request', (done) => {
      const onRender = sinon.spy();

      const root = dom.div({id: 'abcd', onRender}, () => {
        dom.ul({id: 'efgh', onRender}, () => {
          dom.li({id: 'ijkl', onRender}, 'ijkl');
          dom.li({id: 'mnop', onRender}, 'mnop');
          // NOTE: ensure key case changes still work.
          dom.li({id: 'qrst', onRender}, 'qrst');
        });
      });

      function getCallArgument(index) {
        return onRender.getCall(index).args[0];
      }

      renderElement(root, doc);

      config().setTimeout(() => {
        try {
          assert.equal(onRender.callCount, 5);
          assert.equal(getCallArgument(0).id, 'abcd');
          assert.equal(getCallArgument(1).id, 'efgh');
          assert.equal(getCallArgument(2).id, 'ijkl');
          assert.equal(getCallArgument(2).outerHTML, '<li id="ijkl">ijkl</li>');
          assert.equal(getCallArgument(3).id, 'mnop');
          assert.equal(getCallArgument(3).outerHTML, '<li id="mnop">mnop</li>');
          assert.equal(getCallArgument(4).id, 'qrst');
          assert.equal(getCallArgument(4).outerHTML, '<li id="qrst">qrst</li>');
          done();
        } catch (err) {
          done(err);
        }
      }, 0);

    });

    it.skip('receives onRender after being attached', () => {
      // Return true if the provided element is attached to the stub document.
      function elementIsAttached(element) {
        if (element === doc) {
          return true;
        }
        const parent = element.parentNode;
        if (parent) {
          return elementIsAttached(parent);
        }
        return false;
      }

      // Called onRender by nomplate.
      function onRender(element) {
        assert(elementIsAttached(element), 'onRender should be called after attachment to document');
      }

      const element = renderElement(dom.div({id: 'abcd', onRender: onRender}), doc);
      doc.body.appendChild(element);
      console.log('finished');
    });

    describe('deep mutations', () => {
      let element;
      let button;

      function renderDocument(renderHandler) {
        const labels = [];

        function getAddItemHandler(update) {
          return function _getAddItemHandler() {
            labels.push(`item-${labels.length}`);
            update(renderHandler);
          };
        }

        return dom.div(() => {
          dom.header(() => {
            dom.h1('header');
            dom.input();
          });
          dom.section({className: 'main'}, (update) => {
            dom.button({onclick: getAddItemHandler(update)}, 'add');
            dom.ul(() => {
              dom.input({className: 'input'});
              labels.forEach((item) => {
                dom.li(() => {
                  dom.div(() => {
                    dom.div(item);
                  });
                });
              });
            });
          });
        });
      }

      it('removes last item', (done) => {
        function renderHandler() {
          const listItems = element.querySelectorAll('li');

          try {
            assert.equal(listItems.length, 4);
            assert.equal(listItems[0].textContent, 'item-0');
            assert.equal(listItems[1].textContent, 'item-1');
            assert.equal(listItems[2].textContent, 'item-2');
            assert.equal(listItems[3].textContent, 'item-3');
            done();
          } catch(err) {
            done(err);
          }
        }

        element = renderElement(renderDocument(renderHandler), doc);
        button = element.querySelector('button');

        button.click();
        button.click();
        button.click();
        button.click();
      });
    });
  });
});

