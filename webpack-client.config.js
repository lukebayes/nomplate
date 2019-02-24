/* eslint-disable no-console */
console.log('Webpack client config loaded');
/* eslint-enable no-console */

module.exports = {
  name: 'client',
  target: 'web',
  module: {
    rules: [
      {
        loader: 'json-loader',
        test: /\.json$/,
      },
      {
        loader: 'babel-loader',
        test: /\.js$/,
        options: {
          presets: ['es2015'],
        },
      },
    ],
  },
};

