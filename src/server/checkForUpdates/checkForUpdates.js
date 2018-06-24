#!/usr/bin/env node
// const _ = require('lodash');
// const XDate = require('xdate');
const debug = require('debug');
let db = require('bookingsDB')();
let R = require('ramda');
// var PouchDB = require('pouchdb-core')
//   .plugin(require('pouchdb-adapter-http'))
//   .plugin(require('pouchdb-authentication'));

var fs = require('fs');
// var path = require('path');
const Conf = require('conf');
const DS = require('../../mobx/DateStore');
const WS = require('../../mobx/WalksStore');
const MS = require('../../mobx/MembersStore');
const AS = require('../../mobx/AccountsStore');
const PS = require('../../mobx/PaymentsSummaryStore');

const settings = new Conf({
  // projectName: 'StEdsBookings',
  // configName: 'StEdsBooking',
  // cwd: '~/Documents/StEdwards',
});

console.log(settings.get());
console.log(settings.store);

debug.enable('*, -pouchdb*');
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
let argv = require('minimist')(process.argv.slice(2), {
  boolean: ['remote', 'mail', 'fix', 'cleanup', 'verbose', 'mailall', 'prod', 'test'],
  // default: { fix: false, remote: false, mail: false, cleanup: false },
  unknown: arg => {
    console.log('unknown option: ', arg);
    return false;
  },
});
argv.setopts = function(str, val) {
  let self = this;
  str.split(/ +/g).forEach(item => {
    self[item] = val;
  });
  return self;
};
argv.set = function(str) {
  return this.setopts(str, true);
};
argv.unset = function(str) {
  return this.setopts(str, false);
};
if (argv.prod) argv.set('mailall remote').unset('prod');
if (argv.test) argv.unset('remote test mail mailall').set('verbose');
if (argv.cleanup) argv.unset('mail fix verbose').set('verbose');
if (argv.mailall) argv.set('mail');
argv.local = !argv.remote;
const argvOn = Object.keys(argv)
  .reduce((res, key) => (argv[key] === true ? [...res, key] : res), [])
  .join(', ');
logit('argv', argvOn, argv);
// monitorChanges();
const lastRun = '2018-05-19';
const init = async () => {
  const accounts = {};
  const count = {};
  logit('monitorLoading', 'start');
  await PS.init(db);
  await Promise.all([MS.init(db), AS.init(db), WS.init(db)]);
  logit('monitorLoading', 'loaded');
  AS.setActiveAccount('A2005');
  const me = AS.activeAccount;
  const data = me.accountStatusNew;
  logit('stat', data.accName, data);
  dispAccount(data.logs, data.oldestNeededWalk);
  let oldest = {};

  AS.accountsValues.forEach(account => {
    let dat = account.accountStatusNew.oldestNeededWalk;
    if (dat < 'W2018') console.log(dat, account._id, account.name);
    oldest[dat] = (oldest[dat] || 0) + 1;
  });
  oldest = R.toPairs(oldest);
  oldest = R.sortBy(R.prop(0), oldest);
  console.log('oldest');
  oldest.forEach(([dat, count]) => console.log(dat, count));
  /*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                extract recent bookings                   ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
  logit('walks', WS.walks);
  for (let walk of WS.walks.values()) {
    try {
      if (walk.closed) continue;
      const { walkId, venue } = walk;
      for (let [memId, booking] of walk.bookings.entries()) {
        const accId = MS.getAccountForMember(memId);
        for (let log of booking.logs.values()) {
          if (log.dat < lastRun) continue;
          const dat = log.dat.substr(0, 10);
          count[dat] = (count[dat] || 0) + 1;
          if (!accounts[accId]) accounts[accId] = { bookings: [], payments: [] };
          accounts[accId].bookings.push({ ...log, memId, walkId, venue });
        }
      }
    } catch (error) {
      logit('recent changes', accounts, count);
      console.warn(error.stack);
    }
  }
  /*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                extract recent payments                   ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
  logit('accounts', AS.accounts);
  for (let [accId, account] of AS.accounts.entries()) {
    try {
      // const accId = account._id;
      for (let log of account.logs.values()) {
        if (log.dat < lastRun) continue;
        const dat = log.dat.substr(0, 10);
        count[dat] = (count[dat] || 0) + 1;
        if (!accounts[accId]) accounts[accId] = { bookings: [], payments: [] };
        accounts[accId].payments.push({ ...log, accId });
      }
    } catch (error) {
      logit('recent changes', accounts, count);
      console.warn(error.stack);
    }
  }

  logit('accounts', count, accounts);

  /*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                display recent activity                   ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
  let txt = '';

  for (let [accId, entry] of Object.entries(accounts)) {
    const account = AS.accounts.get(accId);
    txt += `\n\nAccount (${accId})  ${account.name}\n`;
    for (let booking of entry.bookings) {
      const memName = MS.getMemberByMemNo(booking.memId).shortName(account, true);
      txt += DS.dispDate(booking.dat) + ' ';
      txt += `booking: ${booking.walkId.substr(1)} ${booking.venue} ${memName} \n`;
    }
    for (let payment of entry.payments) {
      txt += DS.dispDate(payment.dat) + ' ';
      txt += `payment: £${payment.amount} \n`;
    }
  }
  console.log(txt);
};
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                display account status                    ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
const { sprintf } = require('sprintf-js');

function dispAccount(logs, oldest) {
  let txt = '\n\n';
  txt += sprintf(
    'history: %s,  prehistory: %s,  oldest: %s\n\n',
    WS.historyStarts,
    WS.prehistoryStarts,
    oldest,
  );
  txt += '╔' + '═'.repeat(80) + '╗\n';
  logs.forEach(log => {
    let { dispDate, amount = '', balance = '', text, req, name = '', walkId = ' ' } = log;
    let { hideable, historic, prehistoric } = log;
    const stat = historic
      ? 'hist'
      : (hideable ? 'hide' : 'curr') + (prehistoric ? '!' : '');

    txt += sprintf(
      '║ %-12s %-2s %-11s %-34s %-5s',
      dispDate,
      req,
      walkId,
      text + name,
      stat,
    );
    if (req !== 'A') txt += sprintf('£%3d  £%3d', amount, balance);
    else txt += '          ';

    txt += ' ║\n';
    if (log.type === 'A' && log.restartPoint) txt += '╟' + '─'.repeat(80) + '╢\n';
    else if (balance === 0 && amount !== 0) {
      if (log.type === 'A' || /[BC]X?/.test(req)) txt += '╟' + '╴'.repeat(80) + '╢\n';
    }
  });
  txt += '╚' + '═'.repeat(80) + '╝\n';
  // let { mailgunConf } = require(path.resolve(process.cwd(), './config.js'));
  fs.writeFileSync('output.txt', txt);

  logit('formated\n\n', txt);
}
init().catch(error => {
  console.log(error.stack);
});

// const getRev = rev => parseInt(rev.split('━')[0]);
// var coll = new Intl.Collator();
// var datCmp = (a, b) => coll.compare(a.dat, b.dat);
// var idCmp = (a, b) => coll.compare(a.id, b.id);
