import path from 'path';
import renderLayout from './render_layout.js';
import renderString from './render_string.js';


const re = /.*.js$/;

function getLayoutPath(options) {
  if (!options || !options.settings) {
    throw new Error('Nomplate requires options.settings');
  }

  let name = (options.layout || options.settings['view options'].layout);

  if (!options.settings.views) {
    throw new Error('You must configure the views path for layouts');
  }

  if (!name.match(re)) {
    name = `${name}.js`;
  }

  return name ? path.join(options.settings.views, name) : '';
}

export default function renderFile(source, options, callback) {
  try {
    /* eslint-disable global-require */
    /* eslint-disable import/no-dynamic-require */
    console.log('source:', source);
    console.log('layout path:', getLayoutPath(options));
    return import(source)
      .then((viewModule) => {
        const view = viewModule.default;
        if (options.layout === false) {
          callback(null, renderString()(view(options)));
        } else {
          import(getLayoutPath(options))
            .then((layoutModule) => {
              const layout = layoutModule.default;
              /* eslint-enable global-require */
              /* eslint-enable import/no-dynamic-require */
              console.log("YOOOOOOOOO:", layout);
              callback(null, renderLayout(layout, view, options, callback));
            });
        }
      });
  } catch (err) {
    callback(err);
  }
}

