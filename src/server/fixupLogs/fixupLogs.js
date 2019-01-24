#!/usr/bin/env node
const debug = require('debug');
let db = require('bookingsDB')();
// let R = require('ramda');
// var PouchDB = require('pouchdb-core')
//   .plugin(require('pouchdb-adapter-http'))
//   .plugin(require('pouchdb-authentication'));

// var fs = require('fs');
// var path = require('path');
const Conf = require('conf');
import {WS, MS, AS, PS} from 'StEdsStore';

const settings = new Conf({
  // projectName: 'StEdsBookings',
  // configName: 'StEdsBooking',
  // cwd: '~/Documents/StEdwards',
});

console.log(settings.get());
console.log(settings.store);

debug.enable('*, -pouchdb*');
var logit = debug(__filename);
logit.log = console.log.bind(console);
logit.debug = console.debug.bind(console);
console.log('logit enabled:', logit.enabled);
// var bunyan = require('bunyan');
logit.debug('debug');
function logToConsole() {}

logToConsole.prototype.write = function(rec) {
  let { msg, name, hostname, level, v, time, pid, ...obj } = rec; // eslint-disable-line no-unused-vars
  console.log(msg, obj);
};

// var logger = bunyan.createLogger({
//   name: 'bookings', // Required

//   streams: [
//     {
//       type: 'raw',
//       stream: new logToConsole(),
//     },
//   ],
//   src: false, // Optional, see "src" section
// });
const init = async () => {
  logit('monitorLoading', 'start');
  await PS.init(db);
  await Promise.all([MS.init(db), AS.init(db), WS.init(db)]);
  logit('monitorLoading', 'loaded');
  // const accId = 'A718'; // Aidan Nichol
  // AS.setActiveAccount(accId);
  // const me = AS.activeAccount;
  // const data = me.accountStatusNew;
  // let logs = data.logs;
  // const changed = fixupAccLogs(me, logs);
  // if (changed) {
  //   logit('fixupAccLogs changes made', { id: me._id, old: me.logs, logs });
  //   await me.dbUpdate();
  // }
  for (const acc of AS.accountsValues) {
    // AS.accountsValues.forEach(async acc => {
    // if (cnt++ > 100) return;
    console.log('***', acc._id, acc.name);
    const dataO = acc.accountStatus;
    AS.setFullHistory(true);
    const dataN = acc.accountStatusNew;
    const changed = await acc.fixupAccLogs();
    AS.setFullHistory(false);
    const dataF = acc.accountStatusNew;
    // let logs = acc.accountStatusNew.logs;
    if (dataO.balance !== dataN.balance || dataN.balance !== dataF.balance) {
      console.log('balance mismatch', dataO.balance, dataN.balance, dataF.balance);
    }
    if (changed) {
      logit('changes made', { id: acc._id, old: acc.logs, logs: dataN.logs });
      await acc.dbUpdate();
    }
  }
  console.log('\nDone 😀');
  // AS.accountsValues.forEach(account => {
  //   let dat = account.accountStatusNew.oldestNeededWalk;
  //   if (dat < 'W2018') console.log(dat, account._id, account.name);
  // });
  /*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                extract recent bookings                   ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
};
init().catch(error => {
  console.log(error.stack);
});

// const getRev = rev => parseInt(rev.split('━')[0]);
// var coll = new Intl.Collator();
// var datCmp = (a, b) => coll.compare(a.dat, b.dat);
// var idCmp = (a, b) => coll.compare(a.id, b.id);
