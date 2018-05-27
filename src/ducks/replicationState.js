const { decorate, observable, computed, action } = require('mobx');
class ReplState {
  constructor() {
    this.lastAction;
    this.current = 'paused';
    this.dblocal_seq;
    this.push = { written: 0, last_seq: localStorage.getItem('stEdsReplSeq') };
    this.pull = { written: 0, last_seq: null };
  }
  get waiting() {
    return this.dblocal_seq - this.push.last_seq;
  }
  //   async dbChange() {
  //     await updateStateFromLocalDB('db changed');
  //   }
}
decorate(ReplState, {
  lastAction: observable,
  current: observable,
  dblocal_seq: observable,
  push: observable,
  pull: observable,
  waiting: computed,
  dbChange: action,
});
let state = new ReplState();
exports.state = state;
