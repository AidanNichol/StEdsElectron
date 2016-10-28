
var fs = require('fs');
var _ = require('lodash')
var path = require('path');
var packageJson = require('./package.json');

  var json = _.cloneDeep(packageJson);
  delete json.devDependencies;
  delete json.scripts;
  delete json.build;
  delete json.ava;
  console.log(json);
  json.main = 'app.js';
  fs.writeFile(distDir + '/package.json', JSON.stringify(json), function (err) {
    if (err) console.log('copy package.json failed! ', err);
    throw(err);
  });
