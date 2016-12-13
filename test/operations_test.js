import {assert} from 'chai';
import {jsdom} from 'jsdom';

import {Element, operations} from '../';

// NOTE(lbayes): Operation executions are more fully tested in
// render_element_test.js
describe('Nomplate operations', () => {
  let document;

  beforeEach(() => {
    document = jsdom('<body></body>');
  });

  it('createElement', () => {
    const op = operations.createElement(new Element('div'), () => {});
    const element = op(null, null, document);
    assert.equal(element.nodeName, 'DIV');
  });
});

