import {merge} from 'lodash'
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:Booking');
import { observable, computed, asMap} from 'mobx';
import {BookingLog} from 'mobx/BookingLog'
import MS from 'mobx/MembersStore'
// import {_walk} from 'mobx/symbols'


export class Booking{
  @observable status = '';
  @observable annotation = '';
  @observable logs = asMap({})
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
    logs = logs.reverse().map(log=>{
      if (log.req === 'BX')cancelled = true;
      if (log.req === 'B' && cancelled)log.cancelled = true;
      return log;
    }).reverse();
    return logs;
  }
}

var logColl = new Intl.Collator();
var cmpDate = (a, b) => logColl.compare(a.dat, b.dat);
