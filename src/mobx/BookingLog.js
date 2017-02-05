import {request} from 'ducks/walksDuck'
import {merge} from 'lodash'
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'BookingLog');
import { observable, computed, action} from 'mobx';
import {dateDisplay} from 'mobx/DateStore'

export class BookingLog{
  dat;
  @observable req = '';
  who;
  machine = '';
  constructor(log, accessors){
    merge(this, accessors);
    this.updateLog(log)
  }

  // @computed get totalPaid(){
  //
  // }
  @action updateLog = (log)=>{merge(this, log);}

  @computed get mergeableLog(){
    const walk = this.getWalk();
    const member = this.getMember();
    let extra ={type:'W', walkId: walk._id, memId: member.memId,
      dispDate: dateDisplay(this.dat),
      accId: member.accountId, name: member.firstName,}
    if (this.req==='A'){
      extra.text = this.note || ''
    } else {
      extra.amount = (walk.fee || 8) * request.chargeFactor(this.req);
      extra.text = walk.venue.replace(/\(.*\)/, '');
    }
    const log = {...this,  ...extra};
    return log;
  }
}
