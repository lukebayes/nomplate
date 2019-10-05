/* eslint-disable import/no-extraneous-dependencies */
const FakeStorage = require('./test/fake_storage');
const jsdom = require('jsdom').jsdom;
const simulant = require('jsdom-simulant');
const _renderElement = require('./src/render_element');
const _renderString = require('./src/render_string');

/**
 * Create a JSDOM window object for test cases.
 */
function createWindow(optOptions) {
  let doc = jsdom('<html><body></body></html>', optOptions);
  /* eslint-disable no-param-reassign */
  doc.defaultView.localStorage = new FakeStorage();
  /* eslint-enable no-param-reassign */

  doc.defaultView.onerror = (messageOrEvent, source, lineno, colno, error) => {
    console.error('nomplate/test_helper.js createWindow() encountered an uncaught exception. This is likely caused by a thrown exception in an application event handler.');
    console.error(error);
  };
  const win = doc.defaultView;
  /**
   * Set the current URL on the provided window.location object.
   *
   * NOTE(lbayes): Partial implementation by okovpashko, found on Github issue here:
   * https://github.com/facebook/jest/issues/890#issuecomment-298594389
   * Original implementation did not handle search or hash values properly.
   */
  win.setUrl = (urlOrPart) => {
    const url = urlOrPart.indexOf('http') === 0 ? urlOrPart : ['http://example.com', urlOrPart.replace(/^\//, '')].join('/');
    const parser = win.document.createElement('a');
    parser.href = url;
    ['href', 'protocol', 'host', 'hostname', 'origin', 'port', 'pathname'].forEach(prop => {
      Object.defineProperty(win.location, prop, {
        value: parser[prop],
        writable: true,
      });
    });

    const parts = url.split('?');
    const search = parts.length > 1 ? `?${parts[1]}` : '';

    Object.defineProperty(win.location, 'search', {
      value: search,
      writable: true,
    });

    const hash = url.split('#');
    Object.defineProperty(win.location, 'hash', {
      value: hash.length > 1 ? `#${hash[1]}` : '',
      writable: true,
    });
  };

  return win;
}

/**
 * Create a JSDOM window object and return the related document.
 */
function createDocument(optOptions) {
  return createWindow(optOptions).document;
}

function renderString(nomElement, optPrettyPrint) {
	return _renderString()(nomElement, optPrettyPrint);
}

function renderElement(nomElement, optDomElement) {
	return _renderElement(nomElement, createDocument(), optDomElement);
}

module.exports = {
  FakeStorage,
  createDocument,
  createWindow,
  renderElement,
  renderString,
  fire: simulant.fire
};
/* eslint-ensable import/no-extraneous-dependencies */
