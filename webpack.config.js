// var Webpack = require('webpack');
const path = require('path');
const PATHS = {
  app: path.resolve(__dirname, 'app'),
  nodeModules: path.resolve(__dirname, 'node_modules'),

  // build: path.resolve(__dirname, 'public', 'build')
  build: path.resolve(__dirname,  'build')
 }
var appPath = path.resolve(__dirname, 'app');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
// var buildPath = path.resolve(__dirname, 'public', 'build');
var UnusedFilesWebpackPlugin = require("unused-files-webpack-plugin").UnusedFilesWebpackPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const validate = require('webpack-validator');
const merge = require('webpack-merge');
const parts = require('./libs/parts');
const pkg = require('./package.json');
const CircularDependencyPlugin = require('circular-dependency-plugin')
var common = merge(
  {
    context: __dirname,
    entry: {
      // polyfill:'babel-polyfill',
      // 'webpack-dev-server/client?http://localhost:3000',
      // 'webpack/hot/dev-server',
      app: path.resolve(appPath, 'main.js'),
      // vendor: Object.keys(pkg.dependencies)
    },
    output: {
      path: PATHS.build,
      filename: 'bundle.js',
      publicPath: '/'
      // publicPath: '/build/'
    },
    resolve: {
      root: [appPath + '/components', appPath + '/utilities', appPath + '/sass', appPath],
      alias: {
        'react': path.resolve(nodeModulesPath, 'react')
      }
    },
    module: {
      noParse: [/lie\/dist\/lie.js/],
      loaders: [{
        test: /\.jsx?$/,
        loader: 'babel',
        query: {
          optional: 'es7.decorators',
          // presets: ['es2015','stage-0', 'react'],
          // plugins: ['transform-runtime']
        },
        include: PATHS.app,
        exclude: [nodeModulesPath]
      },
      ]
    },

    plugins: [
      // new Webpack.HotModuleReplacementPlugin(),
      new UnusedFilesWebpackPlugin({pattern: 'app/**/*', globOptions: {nodir:true}}),
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /node_modules.*js/,
        // add errors to webpack instead of warnings
        failOnError: false
      }),

      new HtmlWebpackPlugin(
        {
          template: __dirname + '/app/index.html',
          filename: 'index.html',
          inject: 'body',
          title: 'St.Edwards Booking System',
        }
      )
    ]
  },
  parts.setupCSS(PATHS.app)
  // parts.extractBundle({name: 'vendor', entries: })
);

var config;
switch(process.env.npm_lifecycle_event){
  case 'build':
    config = merge(
      common,
      {devtool: 'source-map'}
    );
    break;
  case 'dev':
  case 'start':
    config = merge(
      common,
      {devtool: 'eval-source-map'},
      parts.devServer({host: process.env.HOST, port: 3000})
      // parts.setupCSS(PATHS.app)
    );
    break;
  default:
    config = merge(
      common,
      // parts.setupCSS(PATHS.app),
      {}
    );
    break;
}
module.exports = validate(config);
