var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var utils = require('./utils')
var FriendlyErrors = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

var webpackConfig = merge(baseWebpackConfig, {
  entry: {
    app: './src/dev.js'
  },
  vue: {
    loaders: utils.cssLoaders({
      sourceMap: true,
      extract: false
    })
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': "'development'"
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new FriendlyErrors()
  ]
})

module.exports = webpackConfig
