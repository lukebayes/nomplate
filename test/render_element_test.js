const assert = require('chai').assert;
const builder = require('../').builder;
const createDocument = require('../test_helper').createDocument;
const dom = require('../').dom;
const renderElement = require('../').renderElement;

describe('renderElement', () => {
  let doc;

  beforeEach(() => {
    doc = createDocument();
  });


  describe('creation', () => {
    it('creates simple element', () => {
      const domElement = renderElement(dom.div(), doc);
      assert.equal(domElement.nodeName, 'DIV');
    });

    it('creates element with id', () => {
      const domElement = renderElement(dom.div({id: 'abcd'}), doc);
      assert.equal(domElement.outerHTML, '<div id="abcd"></div>');
    });

    it('assigns textContent', () => {
      const domElement = renderElement(dom.div('one'), doc);
      assert.equal(domElement.outerHTML, '<div>one</div>');
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
      assert.equal(domTwo.className, 'efgh');
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

    it('removes first child', (done) => {
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

      let ul = domElement.firstChild;
      assert.equal(ul.childNodes.length, 3);
      assert.equal(ul.firstChild.id, 'abcd');

      showFirst = false;
      updater();
      builder.forceUpdate();
      assert.equal(ul.firstChild.id, 'efgh');

      showLast = false;
      updater();
      builder.forceUpdate();

      ul = domElement.firstChild;
      assert.equal(ul.lastChild.id, 'efgh');
      assert.equal(ul.childNodes.length, 1);
      done();
    });
  });
});

