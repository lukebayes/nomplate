const assert = require('chai').assert;
const builder = require('../').builder;
const constants = require('../').constants;
const dom = require('../').dom;
const sinon = require('sinon');

describe('Nomplate ElementBuilder', () => {
  beforeEach(() => {
    sinon.stub(console, 'error');
  });

  afterEach(() => {
    /* eslint-disable no-console */
    console.error.restore();
    /* eslint-enable no-console */
  });

  it('creates a simple node', () => {
    const root = builder();
    assert.equal(root.nodeName, 'node');
    assert.equal(root.children.length, 0);
    assert.equal(root.attrs, constants.EMPTY_ATTRS);
    assert.isNull(root.parent);
  });

  it('creates a nested node', () => {
    const root = builder('div', null, () => {
      builder('li', null, null, 'one');
      builder('li', null, null, 'two');
      builder('li', null, null, 'three');
    });

    assert.equal(root.children.length, 3);
    assert.equal(root.children[0].textContent, 'one');
    assert.equal(root.children[1].textContent, 'two');
    assert.equal(root.children[2].textContent, 'three');

    assert.equal(root.children[0].nodeName, 'li');
    assert.equal(root.children[1].nodeName, 'li');
    assert.equal(root.children[2].nodeName, 'li');
  });

  it('processes arguments', () => {
    const root = builder('div', () => {
      builder('li', 'one');
      builder('li', 'two');
      builder('li', 'three');
    });

    assert.equal(root.children.length, 3);
  });

  it('handles null args', () => {
    const root = builder('div', () => {
      builder('div', {className: 'abcd'}, null);
    });

    assert.equal(root.nodeName, 'div');
    assert.equal(root.firstChild.textContent, '');
  });

  it('handles className and style attrs', () => {
    const root = builder('div', () => {
      builder('div', {className: 'abcd', style: {color: 'blue'}}, 'hello');
    });

    assert.equal(root.nodeName, 'div');
    const child = root.firstChild;
    assert.equal(child.nodeName, 'div');
    assert.equal(child.className, 'abcd');
    assert.equal(child.attrs.style, 'color:blue;');
  });

  it('resets the stack, even on error', () => {
    try {
      builder('div', () => {
        builder('div', () => {
          throw new Error('abcd');
        });
      });
    } catch (err) {
      assert.equal(err.message, 'abcd');
      // Ensure the error was logged too
      /* eslint-disable no-console */
      assert.equal(console.error.callCount, 2);
      /* eslint-enable no-console */
    }

    const two = builder('div', 'hello');
    assert.equal(two.textContent, 'hello');
    assert.isNull(two.parent);
  });

  it('handles attrs', () => {
    const script = builder('script', {src: '/abcd.js'});
    assert.equal(script.attrs.src, '/abcd.js');
  });

  it('does not escape markup, unless rendered', () => {
    const div = builder('div', '<script>');
    assert.equal(div.textValue, '<script>');
  });

  it('collapses handler', () => {
    const ul = builder('ul', () => {
      builder('li', 'one');
      builder('li', 'two');
      builder('li', 'three');
    });

    assert.equal(ul.nodeName, 'ul');
    assert.equal(ul.children[0].nodeName, 'li');
    assert.equal(ul.children[1].nodeName, 'li');
    assert.equal(ul.children[2].nodeName, 'li');

    assert.equal(ul.children[0].textContent, 'one');
    assert.equal(ul.children[1].textContent, 'two');
    assert.equal(ul.children[2].textContent, 'three');
  });

  it('onenter and onkeyup are mutually exclusive', () => {
    const handler = sinon.spy();
    assert.throws(() => {
      dom.div({onenter: handler, onkeyup: handler});
    }, /are mutually exclusive/);
  });

  it('onEnter and onKeyUp are mutually exclusive', () => {
    const handler = sinon.spy();
    assert.throws(() => {
      dom.div({onEnter: handler, onKeyUp: handler});
    }, /are mutually exclusive/);
  });

  it('handles null attrs (though not recommended)', () => {
    const ul = builder('ul', null, () => {
      builder('li', null, 'one');
      builder('li', null, 'two');
      builder('li', null, 'three');
    });

    assert.equal(ul.nodeName, 'ul');
    assert.equal(ul.children[0].nodeName, 'li');
    assert.equal(ul.children[1].nodeName, 'li');
    assert.equal(ul.children[2].nodeName, 'li');

    assert.equal(ul.children[0].textContent, 'one');
    assert.equal(ul.children[1].textContent, 'two');
    assert.equal(ul.children[2].textContent, 'three');
  });

  it('sets className with an array', () => {
    const root = dom.div({
      className: ['efgh', null, 'abcd', undefined, -1, 0],
    });

    // NOTE(lbayes): className value should never get sorted by nomplate.
    assert.equal(root.className, 'efgh abcd');
  });

  it('sets className with an object', () => {
    const root = dom.div({
      className: {
        efgh: true,
        abcd: 1,
        ijkl: -1,
        mnop: null,
        qrst: undefined,
      },
    });

    // NOTE(lbayes): className value should never get sorted by nomplate.
    assert.equal(root.className, 'efgh abcd');
  });

  it('sets className with a string', () => {
    const root = dom.div({className: 'efgh abcd'});
    assert.equal(root.className, 'efgh abcd');
  });
});
