const path = require('path');
const renderLayout = require('./render_layout');

function getLayoutPath(options) {
  if (!options || !options.settings) {
    throw new Error('Nomplate requires options.settings');
  }

  const name = (options.layout || options.settings['view options'].layout);

  if (!options.settings.views) {
    throw new Error('You must configure the views path for layouts');
  }

  return name ? path.join(options.settings.views, name) : '';
}

function renderFile(source, options, callback) {
  try {
    /* eslint-disable global-require */
    /* eslint-disable import/no-dynamic-require */
    const view = require(source);
    const layout = require(getLayoutPath(options));
    /* eslint-enable global-require */
    /* eslint-enable import/no-dynamic-require */
    callback(null, renderLayout(layout, view, options, callback));
  } catch (err) {
    callback(err);
  }
}

module.exports = renderFile;

