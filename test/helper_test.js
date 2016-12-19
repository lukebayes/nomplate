const assert = require('chai').assert;
const testHelper = require('../test_helper');

describe('TestHelper test', () => {

  it('has createWindow', (done) => {
    const win = testHelper.createWindow((win) => {
      try {
        assert(win);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});

