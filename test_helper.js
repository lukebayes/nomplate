/* eslint-disable import/no-extraneous-dependencies */
import jsBeautify from 'js-beautify';
import jsdom from 'jsdom';

import FakeStorage from './test/fake_storage';

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

function beautify(element) {
  return jsBeautify.html(element.outerHTML || element);
}

export {
  FakeStorage,
  createWindow,
  beautify,
};
/* eslint-ensable import/no-extraneous-dependencies */
