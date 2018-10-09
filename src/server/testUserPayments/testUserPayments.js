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
  // await Promise.all([MS.init(db), AS.init(db), WS.init(db)]);
  await MS.init(db);
  await WS.init(db);
  await AS.init(db);
  logit('monitorLoading', 'loaded');
  let accId;
  accId = 'A2005'; //margaret Evans
  accId = 'A2024'; // David & Lisa Harris
  accId = 'A2001'; // Julie Edwardson
  accId = 'A122'; // Phil Hickey
  accId = 'A988'; // Gordon Philpott
  accId = 'A718'; // Peter Humpreys
  accId = 'A2041'; // Gwyn Castiaux
  accId = 'A1060'; // Richard Gibson
  accId = 'A1002'; // Christine Ratcliffe
  accId = 'A1003'; // Andrea Bradford
  accId = 'A2052'; // Karen Mallander
  accId = 'A1160'; // Lorraine Allan
  accId = 'A816'; // Jim & Val Davis
  accId = 'A1049'; // Aidan Nichol
  accId = 'A1118'; // Judith Moore
  accId = 'A2069'; // Claire Sandercock
  accId = 'A2027'; // Louise Karmazyn
  accId = 'A1193'; // Lorraine Cooper
  accId = 'A2063'; // Alan Fletcher
  accId = 'A1197'; // Peter Robinson
  AS.setActiveAccount(accId);
  const me = AS.activeAccount;
  const data = me.accountStatusNew;
  logit('stat', data.accName, data);
  let changed = await me.fixupAccLogs(true);

  dispAccount(data);
  if (changed) {
    logit('changes made', { id: me._id, old: me.logs, logs: data.logs });
    await me.dbUpdate();
  }
  AS.setFullHistory(false);
  const data2 = me.accountStatusNew;
  logit('stat', data2.accName, data2);
  dispAccount(data2);

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
  const { accId, logs, accName, activeThisPeriod, paymentsMade, balance } = data;
  let txt = '\n\n';
  txt += sprintf(
    'history: %s,  prehistory: %s,  darkage: %s, active:%s, payments: %d, balance: %d\n\n%s %s\n\n',
    WS.historyStarts,
    WS.prehistoryStarts,
    WS.darkAgesStarts,
    activeThisPeriod,
    paymentsMade,
    balance,
    accId,
    accName,
  );
  txt += '╔' + '═'.repeat(80) + '╗\n';
  logs.forEach(log => {
    let { dispDate, amount = '', balance = '', text, req, name = '', walkId = ' ' } = log;
    let { darkage, hideable, historic, outstanding, prehistoric, logsFrom } = log;
    const stat =
      (darkage ? 'D' : historic ? '⫷' : hideable ? '⪡' : '<') +
      (outstanding ? '£' : '') +
      (prehistoric ? '!' : '');

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

    txt += ' ║ ' + (logsFrom ? logsFrom : '') + '\n';
    if (log.restartPoint) txt += '╟' + '─'.repeat(80) + '╢\n';
    else if (balance === 0 && amount !== 0) {
      if (log.type === 'A' || /[BC]X?/.test(req)) txt += '╟' + '╴'.repeat(80) + '╢\n';
    }
  });
  txt += '╚' + '═'.repeat(80) + '╝\n';
  // let { mailgunConf } = require(path.resolve(process.cwd(), './config.js'));
  fs.writeFileSync('output.txt', txt);

  logit('formated\n\n', txt);
}
try {
  init();
} catch (error) {
  console.log(error.stack);
}
