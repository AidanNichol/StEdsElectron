import { merge } from 'lodash';
import R from 'ramda';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);
import { observable, computed, action } from 'mobx';
import { BookingLog } from 'mobx/BookingLog';
import { getUpdater } from 'ducks/signin-mobx';
import MS from 'mobx/MembersStore';
import DS from 'mobx/DateStore';

export class Booking {
  @observable status = '??';
  @observable annotation = '';
  logs = observable.shallowMap({});
  memId;
  get walk() {
    return this.getWalk();
  }
  constructor(booking, memId, accessors) {
    merge(this, accessors);
    (booking.logs || []).forEach(log => this.logs.set(log.dat, this.newBookingLog(log)));
    delete booking.logs;
    merge(this, booking);
    this.memId = memId;
    // this[_walk] = walk;
  }
  newBookingLog = log =>
    new BookingLog(log, {
      getWalk: this.getWalk,
      getMember: this.getMember,
    });
  getMember() {
    const member = MS.members.get(this.memId);
    const { accountId, firstName, fullName } = member;
    return { memId: this.memId, accountId, firstName, fullName };
  }
  insertLogRecsFromConflicts(logs) {
    for (const log of logs) {
      log.who += '***';
      this.logs.set(log.dat, this.newBookingLog(log));
    }
  }

  resetAnnotationFromConflicts(confLogs) {
    let currLogRecs = this.logs
      .values()
      .filter(log => log.req === 'A')
      .sort(cmpDate);
    let lastAnnotation = currLogRecs.pop() || { dat: '' };
    let extraLogRecs = confLogs
      .filter(log => log.req === 'A')
      .filter(log => log.dat > lastAnnotation.dat)
      .sort(cmpDate);
    if (extraLogRecs.length === 0) return false;
    this.insertLogRecsFromConflicts(extraLogRecs);
    const newestLog = extraLogRecs[extraLogRecs.length - 1];
    this.annotation = newestLog.note;
    this.walk.logger.warn(
      {
        addedLogs: extraLogRecs,
        memId: this.memId,
        oldAnnotation: lastAnnotation.note,
        newAnnotation: this.annotation,
      },
      'updated annotation',
    );
  }
  resetStatusFromConflicts(confLogs) {
    let currLogRecs = this.logs
      .values()
      .filter(log => log.req !== 'A')
      .sort(cmpDate);
    let lastBookingLog = currLogRecs.pop() || { dat: '' };
    let extraLogRecs = confLogs
      .filter(log => log.req !== 'A')
      .filter(log => log.dat > lastBookingLog.dat)
      .sort(cmpDate);
    if (extraLogRecs.length === 0) return false;
    this.insertLogRecsFromConflicts(extraLogRecs);
    const newestLog = extraLogRecs[extraLogRecs.length - 1];
    this.status = newestLog.req;
    this.walk.logger.warn(
      {
        addedLogs: extraLogRecs,
        memId: this.memId,
        oldStatus: lastBookingLog.req,
        newStatus: this.status,
      },
      'updated status',
    );
  }
  @action
  updateBookingRequest(req) {
    if (this.status === req) return; // no change necessary
    const isRequestReversal = this.isRequestReversal(req);
    logit('cancelling', req, DS.todaysDate, this.walk.lastCancel, this.walk);
    if (req === 'BX' && DS.todaysDate > this.walk.lastCancel) {
      logit('updateBookingRequest', 'yes! it is too late');
      req = this.status + 'L';
      this.paid = true;
    }
    this.status = req;

    var newLog = { dat: DS.logTime, who: getUpdater(), req };
    const deletable = this.logs.values().filter(log => DS.datetimeIsRecent(log.dat));
    logit('reversable?', req, {
      reversable: isRequestReversal,
      deletable,
      logs: this.logs,
    });
    if (isRequestReversal) {
      // if a reverse of current status
      if (deletable && deletable.length > 0) {
        // and original req was recent
        deletable.forEach(log => this.logs.delete(log.dat)); //get rid of original log rather than ...
        if (this.logs.values().filter(log => log.req !== 'A').length === 0)
          return (this.deleteMe = true);
        this.status = this.logs
          .values()
          .filter(log => log.req !== 'A')
          .reverse()[0].req; // reset status to last valid req
        return;
      }
    }
    this.logs.set(newLog.dat, this.newBookingLog(newLog)); // adding new log
  }

  isRequestReversal = req => {
    logit(
      'isRequestReversal',
      this.status,
      req,
      this.status[0],
      req[0],
      req.length,
      req.length % 2,
      req.length % 2 + 1,
      this.status.length,
    );
    return this.status[0] === req[0] && this.status.length === req.length % 2 + 1;
  };

  @action
  updateAnnotation(note) {
    var curAnnotation = this.annotation || '';
    if (curAnnotation === note) return false; // no change necessary
    this.annotation = note;
    var newLog = { dat: DS.logTime, who: getUpdater(), req: 'A', note: note };
    var deletable = this.logs
      .values()
      .filter(log => log.req === 'A' && DS.datetimeIsRecent(log.dat));
    if (deletable.length > 0) deletable.forEach(log => this.logs.delete(log.dat));
    logit('updateAnnotation', newLog, deletable, this.logs, note);
    if (this.logs.values().filter(log => log.req === 'A').length > 0 || note !== '') {
      this.logs.set(newLog.dat, this.newBookingLog(newLog));
    }
    return true;
  }

  @action
  resetLateCancellation() {
    if (this.status !== 'BL') return false;
    this.status = 'BX';
    const bLog = this.logs
      .values()
      .filter(log => log.req !== 'A')
      .reverse()[0];
    if (bLog.req === 'BL') bLog.req = 'BX';
  }

  @action
  updateBookingFromDoc = bookingDoc => {
    // const added = R.difference(bookingDoc.logs.map(log=>log.dat), this.logs.keys());
    (bookingDoc.logs || []).forEach(log => {
      if (this.logs.has(log.dat)) this.logs.get(log.dat).updateLog(log);
      else this.logs.set(log.dat, this.newBookingLog(log));
    });
    const deleted = R.difference(this.logs.keys(), bookingDoc.logs.map(log => log.dat));
    deleted.forEach(dat => this.logs.delete(dat));
    delete bookingDoc.logs;
    merge(this, bookingDoc);
    return;
  };

  @computed
  get mergeableLogs() {
    let logs = (this.logs.values() || []).sort(cmpDate).map(log => {
      log = log.mergeableLog;
      let forefited = false;
      // if (limit && log.dat >= limit) continue;
      if (log.req === 'BL') forefited = true;
      else if (forefited) log.amount = 0;
      return log;
    });
    // let cancelled;
    let billable = /^B|BL|C$/.test(this.status);
    logs = logs
      .reverse()
      .map(log => {
        // if (log.req === 'BX')cancelled = true;
        // if (log.req === 'B' && cancelled)log.cancelled = true;
        if (log.req === 'B' || log.req === 'C') {
          log.billable = billable;
          billable = false;
          log.owing = Math.abs(log.amount);
          log.paid = { P: 0, T: 0, '+': 0 };
        } else log.owing = 0;
        return log;
      })
      .reverse();
    return logs;
  }
}

var logColl = new Intl.Collator();
var cmpDate = (a, b) => logColl.compare(a.dat, b.dat);
