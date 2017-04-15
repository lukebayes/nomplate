/* eslint-disable import/no-extraneous-dependencies */
const FakeStorage = require('./test/fake_storage');
const jsdom = require('jsdom').jsdom;

/**
 * Create a JSDOM window object for test cases.
 */
function createWindow(optOptions) {
  let doc = jsdom('<html><body></body></html>', optOptions);
  /* eslint-disable no-param-reassign */
  doc.defaultView.localStorage = new FakeStorage();
  /* eslint-enable no-param-reassign */
  return doc.defaultView;
}

module.exports = {
  FakeStorage,
  createWindow,
};
/* eslint-ensable import/no-extraneous-dependencies */
