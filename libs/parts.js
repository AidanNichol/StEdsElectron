const webpack = require('webpack');


exports.setupCSS = function(paths){
  return {
    module: {
      // noParse: [/lie\/dist\/lie.js/],
      loaders: [
      //   {
      //   test: /\.js$/,
      //   loader: 'babel?optional=es7.decorators',
      //   include: paths,
      //   // exclude: [nodeModulesPath]
      // },
      {
        test: /\.(scss)$/,
        loader: 'style-loader!css-loader!postcss-loader',
        include: paths,
      },
      {
        test: /\.css$/,
        loader: 'style!css!autoprefixer',
        // include: PATHS.app,
      }]
    },
    // postcss: [cssImport, mixins, precss, cssScss, cssFontAwesome, autoprefixer],
    postcss: [cssImport, mixins, nested, cssVars, simpleVars, autoprefixer],

  }
}

const autoprefixer = require('autoprefixer');
const nested = require('postcss-nested');
const mixins = require('postcss-mixins');
const simpleVars = require('postcss-simple-vars');
const cssVars = require('postcss-css-variables');
// const cssScss = require('postcss-scss');
const cssImport = require('postcss-easy-import');
// const cssFontAwesome = require('postcss-font-awesome');
// const precss = require('precss');

exports.devServer = function(options){
  return {
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      stats: 'errors-only',
      host: options.host,
      port: options.port,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({multiStep: true})
    ]
  }
}

exports.extractBundle = function(options) {
  const entry = [];
  entry[options.name] = options.entries;

  return {
    entry: entry,
    plugins: [
      // extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest']
      })
    ]
  }
}
