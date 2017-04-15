const Element = require('../').Element;
const assert = require('chai').assert;
const createWindow = require('../test_helper').createWindow;
const operations = require('../').operations;

// NOTE(lbayes): Operation executions are more fully tested in
// render_element_test.js
describe('Nomplate operations', () => {
  let doc;

  beforeEach(() => {
    doc = createWindow().document;
  });

  it('createElement', () => {
    const op = operations.createElement(new Element('div'), () => {});
    const element = op(null, null, doc);
    assert.equal(element.nodeName, 'DIV');
  });
});

