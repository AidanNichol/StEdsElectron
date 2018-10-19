var bunyan = require('bunyan');
const { getMac } = require('getmac');
let machine;
getMac((err, macAddr) => {
  if (err) throw err;
  machine = macAddr;
});

const fs = require('fs');
const jetpack = require('fs-jetpack');
const Logit = require('logit.js');
var logit = Logit(__filename);
// var logit = (...args) => console.log(...args);
const home = process.env.HOME || process.env.HOMEPATH;
logit('home', home);

let docs = home + '/Documents';
if (!jetpack.exists(docs)) {
  docs = home + '/My Documents';
  if (!jetpack.exists(docs)) docs = home;
}
docs = docs + '/StEdwards/logs';
jetpack.dir(docs);
if (!jetpack.exists(docs)) {
  logit('want to mkdir', docs);
  fs.mkdirSync(docs);
}
let docname = docs + '/bookings.log';
function logToConsole() {}

logToConsole.prototype.write = function(rec) {
  let { msg, name, hostname, level, v, time, pid, ...obj } = rec; // eslint-disable-line no-unused-vars
  logit(msg, obj);
};

exports.logger = bunyan.createLogger({
  name: 'bookings', // Required
  hostname: machine,
  streams: [
    {
      type: 'rotating-file',
      path: docname,
      level: 'info',
      period: '1m', // monthly rotation
      count: 3, // keep 3 back copies
    },
    {
      type: 'raw',
      stream: new logToConsole(),
    },
  ],
  src: false, // Optional, see "src" section
});
// logger.info('hi');
// logger.warn({ lang: 'fr' }, 'au revoir');
// logger.warn({ lang: 'en' }, 'seeya', 'test');
// logger.warn('byee', { lang: 'ch' });
