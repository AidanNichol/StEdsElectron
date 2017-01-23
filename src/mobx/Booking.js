import {merge} from 'lodash'
import R from 'ramda';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:Booking');
import { observable, computed, action} from 'mobx';
import {BookingLog} from 'mobx/BookingLog'
import MS from 'mobx/MembersStore'
// import {_walk} from 'mobx/symbols'


export class Booking{
  @observable status = '';
  @observable annotation = '';
  logs = observable.shallowMap({})
  memId

  constructor(booking, memId, accessors){
    merge(this, accessors);
    (booking.logs || []).forEach(log=>this.logs.set(log.dat, new BookingLog(log, {getWalk: this.getWalk, getMember: this.getMember})))
    delete booking.logs;
    merge(this, booking)
    this.memId = memId
    // this[_walk] = walk;

  }

  getMember = ()=>{
    const member = MS.members.get(this.memId)
    const {accountId, firstName} = member;
    return {memId: this.memId, accountId, firstName};
  }


  @action updateBooking = bookingDoc=>{
    // const added = R.difference(bookingDoc.logs.map(log=>log.dat), this.logs.keys());
    (bookingDoc.logs || []).forEach(log=>{
      if (this.logs.has(log.dat))this.logs.get(log.dat).updateLog(log)
      else this.logs.set(log.dat, new BookingLog(log));
    });
    const deleted = R.difference(this.logs.keys(), bookingDoc.logs.map(log=>log.dat));
    deleted.forEach(dat=>this.logs.delete(dat))
    delete bookingDoc.logs;
    merge(this, bookingDoc);
    return;
  }

  @computed get mergeableLogs(){
    let logs = (this.logs.values()||[]).sort(cmpDate).map((log)=>{
      log = log.mergeableLog;
      let forefited = false;
      // if (limit && log.dat >= limit) continue;
      if (log.req === 'BL')forefited = true;
      else if (forefited) log.amount = 0;
      return log;
    });
    let cancelled;
    let billable = /^B|BL|C$/.test(this.status)
    logs = logs.reverse().map(log=>{
      if (log.req === 'BX')cancelled = true;
      if (log.req === 'B' && cancelled)log.cancelled = true;
      if (log.req === 'B' || log.req === 'C'){
        log.billable = billable;
        billable = false;
        log.owing = Math.abs(log.amount);
        log.paid = {P: 0, T: 0, '+': 0};
      }
      else log.owing = 0;
      return log;
    }).reverse();
    return logs;
  }
}

var logColl = new Intl.Collator();
var cmpDate = (a, b) => logColl.compare(a.dat, b.dat);
