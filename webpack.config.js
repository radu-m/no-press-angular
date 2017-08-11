const path = require('path');
const appPath = path.join(__dirname, './app');
const distPath = path.join(__dirname, './dist');
const pkg = require('./package.json');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

const config = {
  entry: ['babel-polyfill', path.join(appPath, 'index.js')],
  output: {
    path: path.join(distPath),
    publicPath: '/',
    filename: 'bundle-[hash:10].js'
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel', }
    ],
    rules: [
      { test: /\.html$/, use: 'file-loader?name=templates/[name]-[hash:10].html' },
      { test: /\.(js|jsx)$/, exclude: /(node_modules)/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: [/fontawesome-webfont\.svg/, /fontawesome-webfont\.eot/, /fontawesome-webfont\.ttf/, /fontawesome-webfont\.woff/, /fontawesome-webfont\.woff2/], use: 'file-loader?name=fonts/[name].[ext]' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.join(appPath, 'index.ejs') }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new LiveReloadPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    watchContentBase: true,
    compress: true,
    open: true,
    host: '0.0.0.0', // Your Machine Name
    port: '3000'
  },
  devtool: "source-map"
};

module.exports = config;