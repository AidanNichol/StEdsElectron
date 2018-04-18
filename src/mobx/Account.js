import * as mobx from 'mobx';
import db from 'services/bookingsDB';
import { state } from 'ducks/replication-mobx';
import { useFullHistory } from 'ducks/settings-duck';
import R from 'ramda';
import _ from 'lodash';
// import {sprintf} from 'sprintf-js';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);
import { observable, computed, toJS, reaction, action } from 'mobx';
import { FundsManager } from 'mobx/fundsManager';
import MS from 'mobx/MembersStore';
import WS from 'mobx/WalksStore';
import DS from 'mobx/DateStore';
import PS from 'mobx/PaymentsSummaryStore';
import { logger } from 'services/logger.js';

import AccLog from 'mobx/AccLog';
let limit;
logit('dateStore', DS);

export default class Account {
  _id = 0;
  type = 'account';
  _conflicts = [];
  @observable members = [];
  logs = observable.shallowMap({});
  accountId;
  logger;

  constructor(accountDoc, accessors) {
    _.merge(this, accessors);
    reaction(() => this.logs.size, () => logit('autorun', this.report, this.isLoading()));
    (accountDoc.logs || []).forEach(log => this.logs.set(log.dat, new AccLog(log)));
    delete accountDoc.logs;
    _.merge(this, accountDoc);
    // this.updateDocument(accountDoc);
    this.logger = logger.child({ accId: `${this._id} - ${this.name}` });
  }

  get accountStore() {
    return this.getAccountStore();
  }

  // generate name for account based on members names in the account
  @computed
  get name() {
    let nameMap = this.members.reduce((value, memId) => {
      let mem = MS.members.get(memId) || { firstName: '????', lastName: memId };
      let lName = mem.lastName;
      value[lName] = [...(value[lName] || []), mem.firstName];
      return value;
    }, {});
    return Object.entries(nameMap)
      .map(([lName, fName]) => `${fName.join(' & ')} ${lName}`)
      .join(' & ');
  }

  @computed
  get sortname() {
    let nameMap = this.members.reduce((value, memId) => {
      let mem = MS.members.get(memId) || { firstName: '????', lastName: memId };
      let lName = mem.lastName;
      value[lName] = [...(value[lName] || []), mem.firstName];
      return value;
    }, {});
    return Object.entries(nameMap)
      .map(([lName, fName]) => `${lName}, ${fName.join(' & ')}`)
      .join(' & ');
  }

  @computed
  get report() {
    return `Account: ${this._id} ${this.name} ${this.logs.size} ${this.logs.get(
      this.logs.keys().pop(),
    )}`;
  }

  @action
  getConflictingDocs() {
    return `Account: ${this._id} ${this.venue}`;
  }

  /*------------------------------------------------------------------------*/
  /* modify the store with an updated account from the changes feed.        */
  /* - update the log record indiviually                                    */
  /* - delete from the store any log record that have been removed          */
  /* - mergeany other field changes ito the store                           */
  /*------------------------------------------------------------------------*/
  @action
  updateDocument = accountDoc => {
    // const added = R.difference(accountDoc.logs.map(log=>log.dat), this.logs.keys());

    (accountDoc.logs || []).forEach(log => {
      if (this.logs.has(log.dat)) this.logs.get(log.dat).updateLog(log);
      else this.logs.set(log.dat, new AccLog(log));
    });
    const deleted = R.difference(this.logs.keys(), accountDoc.logs.map(log => log.dat));
    deleted.forEach(dat => this.logs.delete(dat));
    delete accountDoc.logs;
    _.merge(this, accountDoc);
    return;
  };

  @action
  deleteMemberFromAccount = memId => {
    this.members.remove(memId);
    logit('deleteMemberFromAccount', `removing ${memId} from ${this._id}`);
    if (this.members.length === 0) {
      this._deleted = true;
      logit('deleteMemberFromAccount', 'deleting account: ${this._id}');
    }
    this.dbUpdate();
  };

  @action
  addMemberToAccount = memId => {
    this.members.push(memId);
    this.dbUpdate();
  };

  @action
  dbUpdate = async () => {
    logit('DB Update start', this);
    let { _conflicts, ...newDoc } = toJS(this);
    newDoc.logs = Object.values(newDoc.logs);
    logit('DB Update', newDoc, newDoc._deleted, _conflicts, this);
    const res = await db.put(newDoc);
    this._rev = res.rev;
    const info = await db.info();
    logit('info', info);
    state.dbChange(info);
  };
  @action
  async deleteConflictingDocs(conflicts) {
    let docs = conflicts.map(rev => {
      return { _id: this._id, _rev: rev, _deleted: true };
    });
    let res = await db.bulkDocs(docs);
    logit('deleteConflicts', this, docs, conflicts, res);
    this._conflicts = [];
  }

  @action
  makePaymentToAccount({ paymentType: req, amount, note, inFull }) {
    // doer = yield select((state)=>state.signin.memberId);
    const who = 'M1180';
    var logRec = { dat: DS.logTime, who, req, type: 'A', amount, note, inFull };
    this.logs.set(logRec.dat, new AccLog(logRec));
    const loggerData = { req, amount, inFull };
    if (note && note !== '') loggerData.note = note;
    this.logger.info(loggerData, 'Payment');
    this.dbUpdate();
  }

  @action
  insertPaymentsFromConflictingDoc(added) {
    let conflicts = this._conflicts;
    if (!_.isEmpty(added)) {
      Object.values(added).forEach(log => {
        var logRec = { ...log, note: (log.note || '') + ' (?)' };
        this.logs.set(logRec.dat, new AccLog(logRec));
      });
      // doer = yield select((state)=>state.signin.memberId);
      this.dbUpdate();
    }
    this.deleteConflictingDocs(conflicts);
  }

  @action
  deletePayment(dat) {
    this.logs.delete(dat);
    this.dbUpdate();
  }

  @computed
  get accountLogs() {
    // logit('accountLogs', this)
    return this.logs
      .values()
      .filter(log => log.req !== 'A' && log.req !== 'S')
      .filter(log => !limit || log.dat < limit)
      .map(log => log.mergeableLog);
  }
  /*----------------------------------------------------------------
  This function looks at all account status records and find the latest
  point before the input date when the account is in balance i.e. all booked
  walks paid for and no credit available.
  In the process it accumulates walk log records for any walks that took
  place prior to that date. The the account went in to balance then it creates
  a dummy zero payment record.
  These log records are save in the payment summary document and used to
  enable the account status to be established without having to work through
  from when this system was established.
  ------------------------------------------------------------------*/
  unclearedBookings(dat) {
    // logit('account:unclearedBookings', this, dat);
    let logs = [];
    let acc = this.accountStatus;
    for (let log of acc.logs.reverse()) {
      if (log.dat > dat) continue;
      if (log.balance === 0) {
        if (log.type !== 'W') break;
        // went into balance by using a credit. create a dummy Payment record
        // one millisecond later to make it easier to recognize what has happended
        logs.push({
          accId: this._id,
          type: 'A',
          req: 'P',
          dat: DS.datetimePlus1(log.dat),
          dispDate: DS.dispDate(DS.datetimePlus1(log.dat)),
          who: log.who,
          amount: 0,
          inFull: true,
        });
        break;
      }
      if (log.type !== 'W' || log.walkId.substr(1) > dat) continue;
      // logit('unclearedBookings', { log, logs });
      logs.push(
        R.pick(
          [
            'text',
            'machine',
            'dat',
            'req',
            'who',
            'type',
            'walkId',
            'memId',
            'dispDate',
            'accId',
            'billable',
            'amount',
            'name',
          ],
          log,
        ),
      );
    }
    return logs;
  }

  @computed
  get accountFrame() {
    const members = new Map(
      this.members
        .map(memId => {
          return [memId, { memId, name: MS.members.get(memId).firstName }];
        })
        .sort(cmpName),
    );
    return { accId: this._id, members, sortname: this.sortname };
  }

  @computed
  get accountMembers() {
    return toJS(
      this.members.map(memId => {
        let mem = MS.members.get(memId);
        return {
          memId: memId,
          firstName: mem.firstName,
          lastName: mem.lastName,
          suspended: mem.suspended,
          subs: mem.subsStatus.status,
        };
      }),
    );
  }

  trimOldAccountLogs(logs, currentPeriodStart) {
    logit('account:unclearedBookings', logs);
    for (var i = logs.length - 1; i >= 0; i--) {
      let log = logs[i];
      if (log.dat > currentPeriodStart) continue;
      if (log.inFull) {
        return logs.slice(i + 1);
      }
    }
    return logs;
  }

  @computed
  get accountStatus() {
    logit('accountStore', this.getAccountStore());
    let traceMe = this._id === this.getAccountStore().activeAccountId;
    // traceMe = true;
    var paymentPeriodStart = PS.lastPaymentsBanked;
    var currentPeriodStart = PS.currentPeriodStart;
    var previousUnclearedBookings = PS.previousUnclearedBookings || {};
    let bookingLogs = WS.allWalkLogsByAccount[this._id] || [];
    let fullLogs = this.accountLogs.concat(bookingLogs).sort(cmpDate);
    let logs;
    if (useFullHistory) currentPeriodStart = null;
    if (currentPeriodStart) {
      bookingLogs = bookingLogs
        .filter(log => log.walkId > 'W' + currentPeriodStart)
        .concat(previousUnclearedBookings[this._id] || []);
      // only 1 member in the account => no need to show member name in transaction
      if (this.members.length === 1) {
        bookingLogs.forEach(log => {
          delete log.name;
        });
      }
      logs = this.accountLogs.concat(bookingLogs).sort(cmpDate);
      logs = this.trimOldAccountLogs(logs, currentPeriodStart);
    } else {
      logs = fullLogs;
    }
    if (traceMe) {
      logit('traceMe', this._id, currentPeriodStart);
      this.logTableToConsole(fullLogs);
      this.logTableToConsole(logs);
      this.logTableToConsole(previousUnclearedBookings[this._id] || []);
    }
    // logit('accountStatus:logs', bookingLogs,logs)
    let balance = 0;
    let activeThisPeriod = false;
    let lastOK = -1;
    let lastHideable = -1;
    let walkPast = 'W' + DS.now.substr(0, 10);
    let currentFound = false;
    let oldBalancePoints = []; // Ids of past walks when we had a zero balance
    // const nbsp = "\u00A0";

    /*------------------------------------------------------------------------*/
    /*    first pass over the data to calculate the running balance and ...   */
    /*        hideable: account in balanced and no open walks involved        */
    /*        historic: account in balanced and all walks in the past         */
    /*        resolved: account in balanced and before start of current period*/
    /*------------------------------------------------------------------------*/
    let mostRecentWalk = '';
    let lastHistory = -1;
    let lastResolved = -1;
    logs = logs.sort(cmpDate).map((olog, i) => {
      const log = R.clone(olog);
      if (i > 0 && logs[i - 1].dat === log.dat && log.type === 'W') {
        log.duplicate = true;
        return log;
      }
      // pass annotation and subscription logs through un altered
      if (log.req === 'A') return log;
      if (log.req === 'S') return log;

      balance -= log.amount;
      log.balance = balance;
      if (log.dat > paymentPeriodStart) log.activeThisPeriod = true;
      if (log.dat > paymentPeriodStart) activeThisPeriod = true;
      if (log.type === 'W') {
        if (log.walkId > mostRecentWalk) mostRecentWalk = log.walkId;
        if (log.walkId > walkPast) currentFound = true;
      }
      if (balance === 0) {
        if (mostRecentWalk <= WS.lastClosed) {
          lastHideable = i;
          oldBalancePoints.push(mostRecentWalk);
        }
        if (!log.activeThisPeriod) lastResolved = i;
        if (!currentFound) lastHistory = i;
      }

      return log;
    });

    logs = logs.map((log, i) => ({
      ...log,
      historic: i <= lastHistory,
      hideable: i <= lastHideable,
    }));

    /*------------------------------------------------------------------------*/
    /*    second pass over the data to work out which walks were paid for     */
    /*    in this banking period.                                             */
    /*                                                                        */
    /*    Look at all records in this banking period back through to the last */
    /*    point were were in balance prior to the the last time we banked the */
    /*    money. If we have instance of a booking being made and cancelled    */
    /*    in this period then flag both entries so they can be ignored        */
    /*------------------------------------------------------------------------*/
    for (let i = logs.length - 1; i > lastResolved; i--) {
      let log = logs[i];
      if (log.req !== 'BX') continue;
      for (let j = i - 1; j > lastResolved; j--) {
        if (logs[j].req !== 'B') continue;
        if (logs[j].walkId !== log.walkId || logs[j].memId !== log.memId) continue;
        log.ignore = true;
        logs[j].billable = false;
        logs[j].ignore = true;
      }
    }
    traceMe && this.logTableToConsole(logs);
    traceMe && logit('second pass', logs, { lastHistory, lastHideable, lastResolved });

    /*------------------------------------------------------------------------*/
    /*    third pass over the data to work out whick walks were paid for      */
    /*    in this banking period and which walks still need to be paid for.   */
    /*                                                                        */
    /*    Work forward from the last resolved point gather up billable records*/
    /*    and then when funds become available either via a payment or a      */
    /*    cancellation allocate them to the walks. Once the walk is fully     */
    /*    paid it is removed from the list. Those left in the list at the end */
    /*    will still need to be paid for.                                     */
    /*                                                                        */
    /*    Note: activeThisPeriod is any log record recorded since the last    */
    /*          banking or any record affected by one of these.               */
    /*          e.g. a walk booked a while ago being paid for by new funds    */
    /*------------------------------------------------------------------------*/
    const fundsManager = new FundsManager();
    fundsManager.traceMe = this._id === 'A1180' || this._id === 'A2032';

    for (let i = lastResolved + 1; i < logs.length; i++) {
      let log = logs[i];
      // pass annotation and subscription logs through un altered
      if (log.req === 'A' || log.req === 'S' || log.duplicate) continue;

      if (log.type === 'W') {
        fundsManager.addWalk(i, log);
        if (log.req === 'BX' && !log.ignore) {
          fundsManager.addCredit(i, log);
        }
        continue;
      }
      // received funds so use on previous outstanding bookings
      if (log.type === 'A') {
        fundsManager.addPayment(i, log);
      }
    }
    fundsManager.allDone(); // anything still unpaid for will flagged as outstanding

    logs = logs
      // .map((log, i)=>({...log, historic: (i <= lastHistory), hideable: (i <= lastHideable), cloneable: (i>lastHistory && log.type === 'W' && log.walkId < walkPast && !log.clone) }))
      .filter(log => !log.duplicate);
    traceMe && this.logTableToConsole(logs);
    traceMe &&
      logit(
        'cashReceivedThisPeriod',
        fundsManager.cashReceivedThisPeriod,
        lastOK,
        paymentPeriodStart,
        this._id,
        this.name,
        logs,
      );
    let debt = [];

    if (balance !== 0) debt = logs.filter(log => log.outstanding);
    // logit('logs final', {accId: this._id, balance, debt, logs, lastHistory, accName: this.name, sortname});
    return {
      accId: this._id,
      balance,
      activeThisPeriod,
      available: fundsManager.available,
      paymentsMade: fundsManager.cashReceivedThisPeriod,
      debt,
      logs,
      lastHistory,
      accName: this.name,
      sortname: this.sortname,
    };
  }

  logTableToConsole = logs => {
    logit.table(
      logs.map(log =>
        R.omit(
          ['note', 'accId', 'machine', 'who', 'dispDate'],
          _.omitBy(log, _.isFunction),
        ),
      ),
    );
  };

  @action
  fixupAccLogs(logs) {
    // make sure the inFull flag in account records is set correctly
    let newLogs = mobx.toJS(logs);
    let changed = false;
    for (let [i, log] of newLogs.entries()) {
      if (log.type !== 'A' || log.req === 'A') continue;
      let actualLogRec = this.logs.get(log.dat);
      let actualInFull = log.balance === 0;
      if (actualInFull === log.inFull) continue;
      newLogs[i].inFull = actualInFull;
      var logRec = { ...actualLogRec, inFull: actualInFull };
      this.logs.set(log.dat, new AccLog(logRec));
      changed = true;
    }

    if (changed) {
      logit('fixupAccLogs changes made', {
        id: this._id,
        old: this.logs,
        new: newLogs,
        logs,
      });
      this.dbUpdate();
    }
    return newLogs;
  }

  /*-------------------------------------------------*/
  /*                                                 */
  /*         Replication Conflicts                   */
  /*                                                 */
  /*-------------------------------------------------*/
  @computed
  get conflictingDocVersions() {
    return R.pluck('_rev', this.conflictingDocs);
  }
  @computed
  get conflictingDocs() {
    return [this, ...this.conflicts.sort((a, b) => getRev(b._rev) - getRev(a._rev))];
  }
  @computed
  get conflictsByDate() {
    let confs = this.conflictingDocs;
    logit('confs', confs);
    let sum = {};
    confs.forEach((conf, i) => {
      this.confLogger = this.logger.child({ confRev: conf._rev });
      (conf.log || []).forEach(lg => {
        let [dat, , , , req, amount] = lg;
        if (req !== 'P') return;
        if (!sum[dat]) sum[dat] = R.repeat('-', confs.length);
        sum.logs[dat][i] = amount;
      });
    });
    // now filter out the OK stuff
    for (let [dat, data] of Object.entries(sum).sort(logCmpDate)) {
      const dataOK = R.all(v => v === data[0], data);
      if (dataOK) delete sum[dat].logs[dat];
      else break;
    }

    return sum;
  }
}
const getRev = rev => parseInt(rev.split('-')[0]);
var coll = new Intl.Collator();
var logCmpDate = (a, b) => coll.compare(a[0], b[0]);
const cmpName = (a, b) => coll.compare(a.name, b.name);
var cmpDate = (a, b) => coll.compare(a.dat, b.dat);
