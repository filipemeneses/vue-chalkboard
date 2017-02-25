var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var utils = require('./utils')

var webpackConfig = merge(baseWebpackConfig, {
  devtool: '#source-map',
  entry: {
    app: './src/dev.js'
  },
  output: {
    filename: '../docs/js/app.js'
  },
  module: {
    loaders: utils.styleLoaders({ sourceMap: false, extract: true })
  },
  vue: {
    loaders: utils.cssLoaders({
      sourceMap: true,
      extract: false
    })
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': "'production'"
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
})

module.exports = webpackConfig
