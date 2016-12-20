const path = require('path');

const renderString = require('./render_string');

// TODO(lbayes): Move this outward.
const render = renderString();

function getLayoutPath(options) {
  const name = (options.layout || options.settings['view options'].layout);

  if (!options.settings.views) {
    throw new Error('You must configure the views path for layouts');
  }

  return name ? path.join(options.settings.views, name) : '';
}

function renderLayout(layoutRenderer, viewRenderer, options, callback) {
  const pretty = !!(options && options.settings && options.settings['view options'].pretty);

  return render(layoutRenderer(options, (err) => {
    if (err) {
      callback(err);
      return;
    }
    viewRenderer(options, (innerErr) => {
      if (innerErr) {
        callback(innerErr);
      }
    });
  }), pretty);
}

module.exports = renderLayout;

