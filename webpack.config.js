var webpack = require('webpack');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
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
// const pkg = require('./package.json');
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

var common2 = merge(
  {
    context: __dirname,
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

      // new HtmlWebpackPlugin(
      //   {
      //     template: __dirname + '/app/index.html',
      //     filename: 'index.html',
      //     inject: 'body',
      //     title: 'St.Edwards Booking System',
      //   }
      // )
    ]
  },
  parts.setupCSS(PATHS.app)
  // parts.extractBundle({name: 'vendor', entries: })
);
var web = merge(
  {
    entry: {
      app: path.resolve(appPath, 'main.js'),
    },
    output: {
      path: PATHS.build,
      filename: 'bundle.js',
      publicPath: '/'
    },
  })

var electron = merge(
  {
    entry: [
      'webpack-hot-middleware/client?reload=true&path=http://localhost:9000/_webpack_hmr',
      path.resolve(appPath, 'indexElectron.js')
    ],
    output: {
      path: PATHS.build,
      filename: 'bundle.js',
      publicPath: 'http://localhost:9000/build/',
      // publicPath: '/build/'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ]
  });

var config;
switch(process.env.npm_lifecycle_event){
  case 'build':
    config = merge(
      common2,
      web,
      {devtool: 'source-map'}
    );
    break;
  case 'dev':
    config = merge(
      common2,
      web,
      {devtool: 'eval-source-map'},
      parts.devServer({host: process.env.HOST, port: 3000})
      // parts.setupCSS(PATHS.app)
    );
    break;
  case 'start':
    config = merge(
      common2,
      electron
      // {devtool: 'eval-source-map'},
    );
    config.target = webpackTargetElectronRenderer(config);
    break;
  default:
    config = merge(
      common2,
      electron,
      // parts.setupCSS(PATHS.app),
      {}
    );
    break;
}
module.exports = validate(config);
