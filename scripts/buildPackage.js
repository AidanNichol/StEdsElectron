
var fs = require('fs');
var _ = require('lodash')
var packageJson = require('../package.json');
var argv = require("argv")
var path = require('path')
const args = argv.option([
    {
        name: 'dest',
        short: 'd',
        type: 'string'
    }
]);
var res = args.run()
const {dest} = res.options;
const out = path.resolve(dest+ '/package.json');
console.log(__dirname,dest,out);
  var json = _.cloneDeep(packageJson);
  delete json.devDependencies;
  delete json.scripts;
  delete json.build;
  delete json.ava;
  json.main = 'app.js';
  // console.log(json);
  fs.writeFileSync(out, JSON.stringify(json));
