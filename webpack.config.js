const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const resolve = require('path').resolve;

module.exports = function (env) {
  if (!env) env = {};
  isProd = (env.prod === true);
  let plugins = [
    new ExtractTextPlugin('styles.css')
  ];

  if (isProd) {
    plugins.push(new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }));
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      }
    }))
  };

  return {
    devtool: isProd ? 'hidden-source-map' : 'hidden-source-map',
    entry: resolve('./browser-src/index'),
    resolve: {
      extensions: [".js", ".jsx", ".json", ".css"],
      modules: [resolve("."), resolve("./browser-src"), resolve("./node_modules")]
    },
    output: {
      path: resolve('./static'),
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.jsx$/,
          loaders: [{ loader: "babel-loader" }],

        },
        {
          test: [/\.css$/],
          loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              { loader: 'css-loader', options: { sourceMap: !isProd } }
            ]
          })
        }]
    },
    plugins: plugins
  }
}