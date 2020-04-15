const dom = require('../../').dom;
const ready = require('../../').ready;
const renderElement = require('../../').renderElement;

const DOM_CONTENT_LOADED = 'DOMContentLoaded';

function client(doc) {
  // Render the application immediately. This can begin before the DOM is fully ready.
  const app = renderElement(dom.h1('HELLO WORLD'), doc);

  ready(doc, () => {
    // Get the element where we will attach the application.
    const context = doc.getElementById('context');
    // Attach the application.
    context.appendChild(app);
  });
}

module.exports = client;

// If we're the entry point (e.g., not running in test environment), execute the
// main client function.
if (require.main === module) {
  client(global.document);
}

