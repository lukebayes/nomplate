/* eslint-disable no-console */
console.log('Webpack client config loaded');
/* eslint-enable no-console */

module.exports = {
  name: 'client',
  target: 'web',
  context: __dirname,
  entry: './client.js',
  output: {
    path: __dirname + '/public',
    filename: 'client-bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        },
      },
    ],
  },
};

