#!/usr/bin/env node
const debug = require('debug');
let db = require('bookingsDB')();
const {format} = require('date-fns');
const _ = require('lodash');
// let R = require('ramda');
const paymentsSummaryReport3 = require('../../reports/paymentsSummaryReport3')
  .paymentsSummaryReport3;
  import {WS, MS, AS, PS, DS} from 'StEdsStore';
const Conf = require('conf');

const { toJS } = require('mobx');

var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

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

  const accountsStatus = toJS(AS.allAccountsStatus).sort(nameCmp);

  // const totalPaymentsMade = accountsStatus.reduce(
  //   (sum, log) => sum + (log.paymentsMade || 0),
  //   0,
  // );

  var startDate = PS.lastPaymentsBanked,
    endDate = AS.paymentsLogsLimit || DS.getLogTime();
  logit('range data', { startDate, endDate });
  const filterCurrentLogs = logs =>
    logs.filter(({ dat }) => dat > startDate && dat < endDate);
  logit('accountsStatus', accountsStatus);
  var cLogs = _.flatten(accountsStatus.map(acc => filterCurrentLogs(acc.logs)));
  // var payments = accountsStatus.filter(acc => acc.paymentsMade > 0);
  var tots = cLogs.reduce((tot, lg) => {
    if (!tot[lg.req]) tot[lg.req] = [0, 0];
    tot[lg.req][0]++;
    tot[lg.req][1] += Math.abs(lg.amount);
    return tot;
  }, {});
  let currentPeriodStart = WS.currentPeriodStart;
  var doc = {
    startDispDate: format(startDate && new Date(startDate), 'dd MMM HH:mm'),
    endDispDate: format(new Date(endDate), 'dd MMM HH:mm'),
    tots,
    startDate,
    endDate,
    accounts: accountsStatus.filter(acc => acc.activeThisPeriod || acc.balance < 0),
    currentPeriodStart,
  };

  paymentsSummaryReport3(doc);

  console.log('\n\n\ndone😀');
  // let oldest = {};
};

init().catch(error => {
  console.log(error.stack);
});
