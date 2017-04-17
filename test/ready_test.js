const assert = require('chai').assert;
const ready = require('../').ready;
const sinon = require('sinon');
const testHelper = require('../test_helper');

describe('ready', () => {
  let doc;

  beforeEach(() => {
    doc = testHelper.createDocument();
  });

  it('subscribes to and unsubscribes from DOMContentLoaded', () => {
    const handler = sinon.spy();
    ready(doc, handler);
    const removeSpy = sinon.spy(doc, 'removeEventListener');

    // Trigger the DOMContentLoaded event.
    testHelper.fire(doc, 'DOMContentLoaded');

    assert.equal(handler.callCount, 1);
    assert.equal(removeSpy.callCount, 1);
    assert.equal(removeSpy.getCall(0).args[0], 'DOMContentLoaded');
  });
});
