const renderLayout = require('./render_layout');

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

