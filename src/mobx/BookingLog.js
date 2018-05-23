const { merge } = require('lodash');
// const Logit = require( 'factories/logit.js');
// var logit = Logit(__filename);
const { observable, computed, action } = require('mobx');
const dateDisplay = require('mobx/DateStore').dispDate;

const chargeFactor = {
  N: 0,
  B: 1,
  W: 0,
  WX: 0,
  WL: 0,
  BX: -1,
  BL: 0, // no credit
  // '+': -1,
  // P: -1,
  // T: -1,
  // '+X': 1,
  // PX: 1,
  // TX: 1,
  C: 0.5,
  CX: -0.5,
  CL: -0.5,
  A: 0,
};
module.exports = class BookingLog {
  dat;
  @observable req = '';
  who;
  machine = '';
  constructor(log, accessors) {
    merge(this, accessors);
    this.updateLog(log);
  }

  // @computed get totalPaid(){
  //
  // }
  @action
  updateLog = log => {
    merge(this, log);
  };

  @computed
  get mergeableLog() {
    const walk = this.getWalk();
    const member = this.getMember();
    let extra = {
      type: 'W',
      walkId: walk._id,
      memId: member.memId,
      dispDate: dateDisplay(this.dat),
      accId: member.accountId,
      name: member.firstName,
    };
    if (this.req === 'A') {
      extra.text = this.note || '';
    } else {
      extra.amount = (walk.fee || 8) * chargeFactor[this.req];
      extra.text = walk.venue.replace(/\(.*\)/, '');
    }
    const log = { ...this, ...extra };
    return log;
  }
};
