var Webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var nested = require('postcss-nested');
var mixins = require('postcss-mixins');
var simpleVars = require('postcss-simple-vars');
var cssVars = require('postcss-css-variables');
// var cssScss = require('postcss-scss');
var cssImport = require('postcss-easy-import');
// var cssFontAwesome = require('postcss-font-awesome');
// var precss = require('precss');
var path = require('path');
var appPath = path.resolve(__dirname, 'app');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');

var config = {
  context: __dirname,
  devtool: 'eval-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/dev-server',
    path.resolve(appPath, 'main.js')],
  // entry: {
  //   app: ['webpack/hot/dev-server',  path.resolve(appPath, 'main.js')]
  // },
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  resolve: {
    root: [appPath + '/components', appPath + '/utilities', appPath + '/factories', appPath + '/scss', appPath],
    alias: {
      'react': path.resolve(nodeModulesPath, 'react')
    }
  },
  module: {
    noParse: [/lie\/dist\/lie.js/],
    loaders: [{
      test: /\.js$/,
      loader: 'babel?optional=es7.decorators',
      exclude: [nodeModulesPath]
    },
    {
      test: /\.(scss)$/,
      loader: 'style-loader!css-loader!postcss-loader'
    },
    {
      test: /\.css$/,
      loader: 'style!css!autoprefixer'
    }]
  },
  // postcss: [cssImport, mixins, precss, cssScss, cssFontAwesome, autoprefixer],
  postcss: [cssImport, mixins, nested, cssVars, simpleVars, autoprefixer],
  plugins: [new Webpack.HotModuleReplacementPlugin()]
};

module.exports = config;
