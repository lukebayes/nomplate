import path from 'path';

import renderString from './render_string';

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

export {
  renderFile,
  renderLayout,
};

