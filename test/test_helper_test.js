const assert = require('chai').assert;
const testHelper = require('../test_helper');

describe('Test Helper', () => {

  it('creates a window', () => {
    const win = testHelper.createWindow();
    assert(win, 'Expected window');
    assert(win.document, 'Expected document');
  });
});
