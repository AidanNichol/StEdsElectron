// require ('babel-polyfill')
// require('../src/helpers.js')
var argv = require('argv');
const glob = require('glob');
var fs = require('fs');
const args = argv.option([
  {
    name: 'src',
    type: 'string',
  },
  {
    name: 'css',
    type: 'string',
  },
  {
    name: 'dest',
    short: 'd',
    type: 'string',
  },
]);
var res = args.run();
const js = '../app/index.js';
const { src, dest, css } = res.options;
const cssF = glob.sync(css).map(c => {
  let nm = `../${dest}${c.substr(3)}`;
  return `<link rel="stylesheet" href="${nm}">`;
});
const html = glob.sync(src);
html.forEach(prg => {
  let lines = fs.readFileSync(prg, { encoding: 'utf8' }).split('\n');
  let i = lines.findIndex(line => /<!-- inject:css -->/.test(line));
  if (i >= 0) {
    lines.splice(i + 1, 0, ...cssF);
  }
  i = lines.findIndex(line => /<!-- inject:js -->/.test(line));
  if (i >= 0) {
    lines.splice(i + 1, 0, `<script src="${js}" ></script>`);
  }
  let out = `${dest}${prg.substr(3)}`;
  console.log(`Processed ${prg}: ${i < 0 ? 0 : cssF.length} items inserted`);
  fs.writeFileSync(out, lines.join('\n'));
});
