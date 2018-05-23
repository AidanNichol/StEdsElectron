const { merge } = require('lodash');
const { observable, action, computed } = require('mobx');
const Logit = require('factories/logit.js');
var logit = Logit(__filename);
const DS = require('./DateStore');
const dateDisplay = require('./DateStore').dispDate;

logit('dateStore', DS);

const chargeFactor = {
  N: 0,
  // B: 1,
  // W: 0,
  // WX: 0,
  // WL: 0,
  // BX: -1,
  // BL: 0, // no credit
  '+': -1,
  P: -1,
  T: -1,
  '+X': 1,
  PX: 1,
  TX: 1,
  // C: 0.5,
  // CX: -0.5,
  // CL: -0.5,
  // A: 0,
};

module.exports = class AccLog {
  dat;
  who;
  machine;
  @observable req = '';
  amount = 0;
  note = '';

  @computed
  get mergeableLog() {
    let amount = this.amount * chargeFactor[this.req];
    return {
      ...this,
      amount,
      dispDate: dateDisplay(this.dat),
      text: this.note,
      type: 'A',
    };
  }

  constructor(log) {
    this.updateLog(log);
    // merge(this, log)
  }

  @action
  updateLog = data => {
    merge(this, data);
  };
};
