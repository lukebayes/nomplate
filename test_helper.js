/* eslint-disable import/no-extraneous-dependencies */
const FakeStorage = require('./test/fake_storage');
const JSDOM = require('jsdom').JSDOM;
const simulant = require('jsdom-simulant');
const _renderElement = require('./src/render_element');
const _renderString = require('./src/render_string');

/**
 * Create a JSDOM window object for test cases.
 */
function createWindow(optOptions) {
  let jsdom = new JSDOM('<html><body></body></html>', optOptions);
  let doc = jsdom.window.document;
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
   */
  win.setUrl = (urlOrPart) => {
    const url = urlOrPart.indexOf("http") === 0 ?
      urlOrPart : `http://example.com/${urlOrPart}`;
    jsdom.reconfigure({ url });
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
