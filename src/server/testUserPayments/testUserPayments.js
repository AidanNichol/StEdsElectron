#!/usr/bin/env node
const debug = require('debug');
let db = require('bookingsDB')();
// let R = require('ramda');

var fs = require('fs');
// var path = require('path');
const Conf = require('conf');
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

logit.debug('debug');

const init = async () => {
  logit('monitorLoading', 'start');
  await PS.init(db);
  await Promise.all([MS.init(db), AS.init(db), WS.init(db)]);
  logit('monitorLoading', 'loaded');
  let accId;
  accId = 'A2005'; //margaret Evans
  accId = 'A2024'; // DAvid & Lisa Harris
  // accId = 'A2001'; // Julie Edwardson
  accId = 'A122'; // Phil Hickey
  accId = 'A988'; // Gordon Philpott
  AS.setActiveAccount(accId);
  const me = AS.activeAccount;
  const data = me.accountStatusNew;
  logit('stat', data.accName, data);
  dispAccount(data);
  console.log('\n\n\ndone😀');
  // let oldest = {};
};
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                display account status                    ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
const { sprintf } = require('sprintf-js');

function dispAccount(data) {
  const { logs, oldest, accName, activeThisPeriod, paymentsMade, balance } = data;
  let txt = '\n\n';
  txt += sprintf(
    'history: %s,  prehistory: %s,  oldest: %s, active:%s, payments: %d, balance: %d\n\n%s\n\n',
    WS.historyStarts,
    WS.prehistoryStarts,
    oldest,
    activeThisPeriod,
    paymentsMade,
    balance,
    accName,
  );
  txt += '╔' + '═'.repeat(80) + '╗\n';
  logs.forEach(log => {
    let { dispDate, amount = '', balance = '', text, req, name = '', walkId = ' ' } = log;
    let { hideable, historic, prehistoric } = log;
    const stat = historic ? '⫷' : (hideable ? '⪡' : '<') + (prehistoric ? '!' : '');

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
    if (log.type === 'A' && log.clearedUpto) txt += '╟' + '─'.repeat(80) + '╢\n';
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
