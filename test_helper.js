/* eslint-disable import/no-extraneous-dependencies */
const FakeStorage = require('./test/fake_storage');
const jsdom = require('jsdom');

/**
 * Create a fake JSDOM window object.
 */
function createWindow(ready) {
  jsdom.env('<html><body></body></html>', null, (err, window) => {
    /* eslint-disable no-param-reassign */
    window.localStorage = new FakeStorage();
    /* eslint-enable no-param-reassign */
    ready(window);
  });
}

module.exports = {
  FakeStorage,
  createWindow,
};
/* eslint-ensable import/no-extraneous-dependencies */
