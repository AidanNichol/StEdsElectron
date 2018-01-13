import debug from 'debug';
import _ from 'lodash';
export var opts = {};
export var logitCodes = [];
const debugme = debug('logit:setup');
const debug2 = debug('steds:logit');
let enableStr = localStorage.getItem('debug');
enableStr = enableStr
  .split(',')
  // .filter(str => !str.includes('logit'))
  .filter(str => !str.includes('logit') && !str.includes('pouchdb'))
  .join(',');
debug.enable(enableStr + ',steds:logit,-logit:setup');
// debug.enable(enableStr + ',steds:logit,-logit:setup, -pouchdb*');
debug2('enable string', enableStr);
export default function Logit(source) {
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
  const parts = source.split('/app/');
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
  localStorage.setItem('logitCodes', JSON.stringify(logitCodes));
  _.set(opts, source.split(':'), true);
  debugme(
    'logit setup',
    debb,
    source,
    logitCodes,
    opts,
    localStorage.getItem('logitCodes'),
  );
  let backgroundColor = debb.color;
  let textColor = getContrastYIQ(backgroundColor);
  let colorFormat = `color:${textColor}; background:${backgroundColor}; font-weight:bold`;
  const logit = (...Y) => debb('%c %s ', colorFormat, ...Y);
  logit.table = Y => debb.enabled && console.table(Y);
  return logit;
}
function getContrastYIQ(hexcolor) {
  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 120 ? 'black' : 'white';
  // return yiq > 120 ? '#000000' : '#ffffff';
}
