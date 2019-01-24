#!/usr/bin/env node
const _ = require('lodash');
const debug = require('debug');
let db = require('bookingsDB')(true);
let generateEmail = require('./generateEmail');

const Conf = require('conf');
import {WS, MS, AS, PS, DS} from 'StEdsStore';

// const path = require('path');
const settings = new Conf({
  // projectName: 'StEdsBookingsCheckForUpdates',
  configName: 'checkForUpdates',
  // cwd: process.cwd(),
});

console.log(settings.get());
console.log(settings.store);
console.log(settings.path);

// let { mailgunConf } = require(path.resolve(process.cwd(), './config.js'));
let mailgunConf = settings.get('mailgunConf');

debug.enable('updates, -pouchdb*');
var logit = debug('updates');
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

// let lastRun = '2018-07-20';
let lastRun = settings.get('lastRun');
let changedAccounts = {};
const init = async () => {
  logit('monitorLoading', 'start');
  const info = await db.info();
  logit('monitorLoading', 'info', info);
  await PS.init(db);
  logit('monitorLoading', 'PS');
  await MS.init(db);
  logit('monitorLoading', 'MS');
  await WS.init(db);
  logit('monitorLoading', 'WS');
  await AS.init(db);
  logit('monitorLoading', 'AS');
  //  monitorChanges(db, info);
  emitter.emit('startMonitoring', db);
  //   })
  //   .catch(error => {
  //     console.warn('monitoring errored', error);
  //   });
};
init()
  .then(() => {
    for (const account of AS.accountsValues) {
      getMailAddress(account);
    }
  })
  .catch(error => {
    console.log('init caught error', error.stack);
  });
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                display recent activity                   ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */

async function processChanges() {
  console.log('process changes', changedAccounts);
  let accIds;
  [changedAccounts, accIds] = [{}, changedAccounts];
  for (let accId of Object.keys(accIds)) {
    AS.setActiveAccount(accId);
    const account = await AS.activeAccount;
    const email = getMailAddress(account);
    console.log('mail address', accId, account.name, email);
    // if (!isValidEmail(email)) console.warn('oh dear - email not valid');
    if (!email) continue;
    const mail = generateEmail(account, lastRun, WS.openWalks, 'W' + DS.todaysDate);
    sendEmail(mail, email);
  }
  lastRun = DS.getLogTime();
  settings.set('lastRun', lastRun);
}

const Emittery = require('emittery');
const emitter = new Emittery();
let timeoutId = null;
const idletime = 60 * 1000;

emitter.on('accChanged', accId => {
  changedAccounts[accId] = true;
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(processChanges, idletime);
  console.log('accChanged', accId, changedAccounts);
});
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                extract recent bookings                   ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */

function getWalkChanges(id) {
  const walk = WS.walks.get(id);
  if (walk.closed || !walk.bookings) return;

  for (let [memId, booking] of walk.bookings.entries()) {
    let logs = booking.logsValues.filter(log => log.dat > lastRun);
    if (logs.length === 0) continue;
    const accId = MS.getAccountForMember(memId);
    emitter.emit('accChanged', accId);
  }
}
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                extract recent payments                   ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
function getAccountChanges(accId) {
  const account = AS.accounts.get(accId);
  let logs = Array.from(account.logs.values()).filter(log => log.dat > lastRun);
  if (logs.length > 0) emitter.emit('accChanged', accId);
}
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃      Generate and send the email about the changes       ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
var mailgun = require('mailgun-js')(mailgunConf);
function sendEmail(body, email) {
  var data = {
    from: 'St.Edwards Booking System <aidan@mg.nicholware.co.uk>',
    to: email,
    bcc: 'aidan@nicholware.co.uk, patjohnson613@gmail.com, sandysandy48@hotmail.co.uk',
    subject: 'Booking Receipt ' + DS.now,
    text: 'Bookings and/or payments made to: ' + email,
    html: body,
  };

  mailgun.messages().send(data, function(error, body) {
    console.log(body);
  });
}
function getMailAddress(account) {
  let mems = account.accountMembers;
  mems = mems
    .filter(mem => (mem.email || '').includes('@'))
    .filter(mem => {
      if (isValidEmail(mem.email)) return true;
      console.warn('oh dear - email not valid');
      console.log(mem.memId, mem.firstName, mem.lastName, mem.email);
      return false;
    })
    .filter(mem => (mem.roles || '').includes('tester'))
    .filter(mem => !(mem.roles || '').includes('no-receipt'));
  let emails = mems.reduce((acc, mem) => [...acc, mem.email], []);
  if (emails.length === 0) return false;
  return _.uniq(emails).join(', ');
}
const tester = /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
// Thanks to:
// http://fightingforalostcause.net/misc/2006/compare-email-regex.php
// http://thedailywtf.com/Articles/Validating_Email_Addresses.aspx
// http://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses/201378#201378
const isValidEmail = email => {
  if (!email) return false;

  if (email.length > 254) return false;

  var valid = tester.test(email);
  if (!valid) return false;

  // Further checking of some things regex can't handle
  var parts = email.split('@');
  if (parts[0].length > 64) return false;

  var domainParts = parts[1].split('.');
  if (
    domainParts.some(function(part) {
      return part.length > 63;
    })
  )
    return false;

  return true;
};
/*
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃                                                          ┃
  ┃                monitor db changes                        ┃
  ┃                                                          ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */

var storeFn = {
  walk: WS.changeDoc,
  account: AS.changeDoc,
  member: MS.changeDoc,
  bankPayments: AS.changeDoc,
};

const collections = {
  M: 'member',
  W: 'walk',
  A: 'account',
  BP: 'paymentSummary',
  BS: 'bankSubscriptions',
};

let lastSeq;
emitter.on('startMonitoring', db => {
  monitorChanges(db);
  logit('monitorLoading', 'loaded');
});

async function monitorChanges(db) {
  // logit('info', info);
  // lastSeq = info.update_seq;
  lastSeq = settings.get('lastSeq');
  // lastSeq -= 60;
  let monitor = db
    .changes({ since: lastSeq, live: true, timeout: false, include_docs: true })
    .on('change', info => handleChange(info))
    .on('complete', () => {})
    .on('error', error => {
      logit('changes_error', error);
      timeoutId = setTimeout(() => emitter.emit('startMonitoring', db), idletime);
    });
  // The subscriber must return an unsubscribe function
  return () => monitor.cancel();
}

const handleChange = change => {
  if (change.id[0] === '_' || (change.doc && !change.doc.type)) return;
  var collection =
    (change.doc && change.doc.type) || collections[change.id.match(/$([A-Z]+)/)[0]];
  logit('change', { change, collection });
  if (storeFn[collection]) {
    storeFn[collection](change); // update Mobx store
    lastSeq = change.seq;
    settings.set('lastSeq', change.seq);
    if (collection === 'walk' && !change.deleted) getWalkChanges(change.id);
    if (collection === 'account' && !change.deleted) getAccountChanges(change.id);
  }
};

// const getRev = rev => parseInt(rev.split('━')[0]);
// var coll = new Intl.Collator();
// var datCmp = (a, b) => coll.compare(a.dat, b.dat);
// var idCmp = (a, b) => coll.compare(a.id, b.id);
