const assert = require('chai').assert;
const builder = require('../').builder;
const createWindow = require('../test_helper').createWindow;
const dom = require('../').dom;
const events = require('../').events;
const renderElement = require('../').renderElement;
const sinon = require('sinon');

describe('renderElement', () => {
  let doc, win;

  beforeEach(() => {
    win = createWindow();
    doc = win.document;
  });


  describe('creation', () => {
    it('creates simple element', () => {
      const domElement = renderElement(dom.div(), doc);
      assert.equal(domElement.nodeName, 'DIV');
    });

    it('creates an element with numeric value', () => {
      const domElement = renderElement(dom.div(23), doc);
      assert.equal(domElement.outerHTML, '<div>23</div>');
    });

    it('creates element with id', () => {
      const domElement = renderElement(dom.div({id: 'abcd'}), doc);
      assert.equal(domElement.outerHTML, '<div id="abcd"></div>');
    });

    it('assigns textContent', () => {
      const domElement = renderElement(dom.div('one'), doc);
      assert.equal(domElement.outerHTML, '<div>one</div>');
    });

    it('removes false attributes', () => {
      const domElement = renderElement(dom.input({type: 'checkbox', checked: "false"}), doc);
      assert.equal(domElement.outerHTML, '<input type="checkbox">');
    });

    it('creates children', () => {
      const domElement = renderElement(dom.div(() => {
        dom.ul(() => {
          dom.li('one');
          dom.li('two');
          dom.li('three');
        });
      }), doc);

      const ul = domElement.firstChild;
      assert.equal(ul.nodeName, 'UL');
      assert.equal(ul.childNodes.length, 3);
      assert.equal(ul.childNodes[0].textContent, 'one');
      assert.equal(ul.childNodes[1].textContent, 'two');
      assert.equal(ul.childNodes[2].textContent, 'three');
    });
  });

  describe('updates', () => {
    it('updates element className', () => {
      const domOne = renderElement(dom.div({className: 'abcd'}), doc);
      const domTwo = renderElement(dom.div({className: 'efgh'}), doc, domOne);

      assert(domOne === domTwo, 'Elements should be the same');
      assert.equal(domTwo.className, 'efgh', 'dom two className');
      assert.equal(domOne.className, 'efgh', 'Should modify original reference');
    });

    it('updates element text content', () => {
      let updater = null;
      let label = 'two';
      let id = 'abcd';
      let ul;

      const domElement = renderElement(dom.div(() => {
        dom.ul((update) => {
          updater = update;
          dom.li('one');
          dom.li({id: id}, label);
          dom.li('three');
        });
      }), doc);

      ul = domElement.firstChild;

      assert.equal(ul.nodeName, 'UL');
      assert.equal(ul.childNodes.length, 3);
      assert.equal(ul.childNodes[0].textContent, 'one');
      assert.equal(ul.childNodes[1].textContent, 'two');
      assert.equal(ul.childNodes[2].textContent, 'three');

      label = 'two-point-five';
      id = 'efgh';
      updater();
      builder.forceUpdate();

      ul = domElement.firstChild;
      assert.equal(ul.nodeName, 'UL');

      // assert.equal(ul.childNodes.length, 3);
      assert.equal(ul.childNodes[0].textContent, 'one');
      assert.equal(ul.childNodes[1].textContent, 'two-point-five');
      assert.equal(ul.childNodes[2].textContent, 'three');
    });

    it('assigns click handler', () => {
      const handler = sinon.spy();
      const element = renderElement(dom.button({onClick: handler}), doc);
      element.click();
      assert.equal(handler.callCount, 1);
    });

    it('assigns onkeydown handler', () => {
      const handler = sinon.spy();
      const element = renderElement(dom.input({onkeydown: handler}), doc);
      const keyEvent = new win.KeyboardEvent(events.KEY_DOWN, {keyCode: 24, bubbles: true});
      element.dispatchEvent(keyEvent);
      assert.equal(handler.callCount, 1);
    });

    it('assigns onenter handler', () => {
      const handler = sinon.spy();
      const element = renderElement(dom.input({onEnter: handler}), doc);
      const keyEvent = new win.KeyboardEvent(events.KEY_UP, {keyCode: 13});
      element.dispatchEvent(keyEvent);
      assert.equal(handler.callCount, 1);
    });

    it('removes first child', () => {
      let updater = null;
      let showFirst = true;
      let showLast = true;

      const nomElement = dom.div(() => {
        dom.ul((update) => {
          updater = update;
          if (showFirst) {
            dom.li({id: 'abcd'});
          }
          dom.li({id: 'efgh'});
          if (showLast) {
            dom.li({id: 'ijkl'});
          }
        });
      });

      const domElement = renderElement(nomElement, doc);

      // UL has three children.
      const ul = domElement.firstChild;
      assert.equal(ul.childNodes.length, 3);
      assert.equal(ul.firstChild.id, 'abcd');

      // Update removes first child.
      showFirst = false;
      updater();
      builder.forceUpdate();
      assert.equal(ul.firstChild.id, 'efgh');

      // Update removes first and last child.
      showLast = false;
      updater();
      builder.forceUpdate();

      assert.equal(ul.lastChild.id, 'efgh');
      assert.equal(ul.childNodes.length, 1);

      // Update adds first and last children back.
      showFirst = true;
      showLast = true;
      updater();
      builder.forceUpdate();

      const kids = ul.childNodes;
      assert.equal(kids.length, 3);
      assert.equal(kids[0].id, 'abcd');
      assert.equal(kids[1].id, 'efgh');
      assert.equal(kids[2].id, 'ijkl');
    });

    it('skips falsy values on update', () => {
      let isChecked = true;
      let updater;

      const nomElement = dom.div((update) => {
        updater = update;
        dom.input({type: 'checkbox', checked: isChecked});
      });

      const domElement = renderElement(nomElement, doc);
      isChecked = false;

      updater();
      builder.forceUpdate();

      assert.equal(domElement.outerHTML, '<div><input type="checkbox"></div>');
    });

    it('represents checked attribute in property as well', () => {
      let isChecked = true;
      let updater;

      const nomElement = dom.div((update) => {
        updater = update;
        dom.input({type: 'checkbox', checked: isChecked});
      });

      const domElement = renderElement(nomElement, doc);
      assert(domElement.firstChild.checked, 'Expected checkbox property to be applied');

      isChecked = false;
      updater();
      builder.forceUpdate();

      assert(!domElement.firstChild.checked, 'Expected checkbox property to be applied');
      assert.equal(domElement.outerHTML, '<div><input type="checkbox"></div>');
    });

    it('represents value attribute in property as well', () => {
      let value = true;
      let updater;

      const nomElement = dom.div((update) => {
        updater = update;
        dom.input({type: 'checkbox', checked: value});
      });

      const domElement = renderElement(nomElement, doc);
      assert.equal(domElement.firstChild.outerHTML, '<input type="checkbox" checked="true">');
      assert(domElement.firstChild.checked, 'Expected checkbox property to be applied');

      value = false;
      updater();
      builder.forceUpdate();

      assert.equal(domElement.outerHTML, '<div><input type="checkbox"></div>');
      assert(!domElement.firstChild.checked, 'Expected checkbox property to be updated');
    });

    it('never writes classname or key attributes', () => {
      let updater;

      const nomElement = dom.div((update) => {
        updater = update;
        dom.div({className: 'abcd', key: 'efgh'});
      });

      const domElement = renderElement(nomElement, doc);
      assert.equal(domElement.outerHTML, '<div><div class="abcd" data-nom-key="efgh"></div></div>');

      updater();
      builder.forceUpdate();

      assert.equal(domElement.outerHTML, '<div><div class="abcd" data-nom-key="efgh"></div></div>',
        'Should not introduce two attributes (class & classname) when value is unchanged');
    });

    it('adds truthy and removes falsy className values', () => {
      let updater;
      let className = 'abcd';

      const nomElement = dom.div((update) => {
        updater = update;
        dom.div({className: className});
      });

      const domElement = renderElement(nomElement, doc);

      // Use a simple string value:
      assert.equal(domElement.outerHTML, '<div><div class="abcd"></div></div>');

      // Use a falsy (null) value:
      className = null;
      updater();
      builder.forceUpdate();
      assert.equal(domElement.outerHTML, '<div><div></div></div>');

      // Use a falsy (undefined) value:
      className = undefined;
      updater();
      builder.forceUpdate();
      assert.equal(domElement.outerHTML, '<div><div></div></div>');

      // Use a falsy (0) value:
      className = 0;
      updater();
      builder.forceUpdate();
      assert.equal(domElement.outerHTML, '<div><div></div></div>');

      // Use a hash of truthy keys:
      className = {abcd: true, efgh: true, ijkl: true, mnop: false};
      updater();
      builder.forceUpdate();
      assert.equal(domElement.outerHTML, '<div><div class="abcd efgh ijkl"></div></div>');

      // All keys are falsy:
      className = {abcd: false, efgh: false, ijkl: false};
      updater();
      builder.forceUpdate();
      assert.equal(domElement.outerHTML, '<div><div></div></div>');

      // Use an array of strings:
      className = ['abcd', 'efgh', 'ijkl'];
      updater();
      builder.forceUpdate();
      assert.equal(domElement.outerHTML, '<div><div class="abcd efgh ijkl"></div></div>');
    });

    it('updates reordered children with keys', () => {
      let updater;
      let data = ['abcd', 'efgh', 'ijkl'];
      const nomElement = dom.div(() => {
        dom.ul({id: 'container'}, (update) => {
          updater = update;

          data.forEach((entry) => {
            dom.li({key: entry}, entry);
          });
        });
      });

      const domElement = renderElement(nomElement, doc);

      // Make a copy of childNodes so that we can check the first result against
      // second result.
      const firstKids = Array.prototype.slice.call(domElement.firstChild.childNodes);
      assert.equal(firstKids.length, 3);
      assert.equal(firstKids[0].textContent, 'abcd');
      assert.equal(firstKids[0].getAttribute('data-nom-key'), 'abcd');
      assert.equal(firstKids[1].textContent, 'efgh');
      assert.equal(firstKids[1].getAttribute('data-nom-key'), 'efgh');
      assert.equal(firstKids[2].textContent, 'ijkl');
      assert.equal(firstKids[2].getAttribute('data-nom-key'), 'ijkl');

      data = data.reverse();
      updater();
      builder.forceUpdate();

      const secondKids = domElement.firstChild.childNodes;
      assert.equal(secondKids[0].textContent, 'ijkl');
      assert.equal(secondKids[1].textContent, 'efgh');
      assert.equal(secondKids[2].textContent, 'abcd');

      assert(firstKids[0] === secondKids[2], 'First and last children are reverse');
      assert(firstKids[1] === secondKids[1], 'Middle kid remains');
    });
  });

  it('accepts inline style declarations', () => {
    var updater;
    const style = {
      color: '#fc0',
    };
    const nomElement = dom.div((update) => {
      updater = update;
      dom.div({style: style});
    });
    const domElement = renderElement(nomElement, doc);

    assert.equal(domElement.outerHTML, '<div><div style="color:#fc0;"></div></div>');
    style.color = '#f00';
    updater();
    builder.forceUpdate();
    assert.equal(domElement.outerHTML, '<div><div style="color:#f00;"></div></div>');

    style.color = '';
    updater();
    builder.forceUpdate();
    assert.equal(domElement.outerHTML, '<div><div></div></div>');

    style.color = null;
    updater();
    builder.forceUpdate();
    assert.equal(domElement.outerHTML, '<div><div></div></div>');
  });

  it('ignores empty inline style declaration', () => {
    const nomElement = dom.div({className: 'efgh', style: {}});
    const domElement = renderElement(nomElement, doc);
    assert.equal(domElement.outerHTML, '<div class="efgh"></div>');
  });
});

