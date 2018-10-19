const debug = require('debug');
const _ = require('lodash');
// export var opts = {};
// export var logitCodes = [];
var opts = {};
var logitCodes = [];
const debugme = debug('logit:setup');
const debug2 = debug('steds:logit');
let enableStr = '';
if (typeof window !== 'undefined') enableStr = window.localStorage.getItem('debug') || '';
enableStr = (enableStr || '')
  .replace(/"/g, '')
  .split(',')
  // .filter(str => !str.includes('logit'))
  .filter(str => !str.includes('logit') && !str.includes('pouchdb'))
  .join(',');
// enableStr += ',steds:logit,-logit:setup';
debug.enable(enableStr);
// debug.enable(enableStr + ',steds:logit,-logit:setup, -pouchdb*');
debug2('enable string', enableStr);
// export default function Logit(source) {
module.exports = function Logit(source) {
  const symbs = {
    components: '⚙️',
    views: '️⛰',
    ducks: '️🦆',
    utility: '️🚧',
    reports: '🖨',
    mobx: '𝔐𝔛',
    containers: '📦',
  };
  if (/^(color|backg)/.test(source)) console.error('logit old style', source);
  const parts = source.split(/[\\/]app[\\/]/);
  if (parts.length > 1) {
    source = parts[1];
  }
  source = source
    .replace(/\//g, ':')
    .replace(/-mobx|.js/g, '')
    .split(':')
    .map(tk => symbs[tk] || tk)
    .join(':');

  let debb = debug(`⨁:${source}`);
  logitCodes.push(`⨁:${source}`);
  if (typeof window !== 'undefined')
    localStorage.setItem('logitCodes', JSON.stringify(logitCodes));
  _.set(opts, source.split(':'), true);
  debugme(
    'logit setup',
    debb,
    source,
    logitCodes,
    opts,
    typeof window !== 'undefined' ? localStorage.getItem('logitCodes') : '',
  );
  // console.warn('debugme enabled:', debugme.enabled, `⨁:${source} enabled`, debb.enabled);
  let backgroundColor = debb.color;
  let textColor = getContrastYIQ(backgroundColor);
  let colorFormat = `color:${textColor}; background:${backgroundColor}; font-weight:bold`;
  const logit = (...Y) => debb('%c %s ', colorFormat, ...Y);
  logit.table = Y => debb.enabled && console.table(Y);
  return logit;
};
function getContrastYIQ(hexcolor) {
  if (typeof hexcolor !== 'string') return 'black';
  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 120 ? 'black' : 'white';
  // return yiq > 120 ? '#000000' : '#ffffff';
}
