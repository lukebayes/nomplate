const DOM_CONTENT_LOADED = 'DOMContentLoaded';

/**
 * Helper method that makes it a little easier to do the right thing during
 * client page initialization.
 */
function ready(document, callback) {
  function handler(event) {
    callback();
    document.removeEventListener(DOM_CONTENT_LOADED, handler);
  }

  document.addEventListener(DOM_CONTENT_LOADED, handler);
}

module.exports = ready;
