import XDate from 'xdate';
import { observable, computed, action } from 'mobx';
// import Logit from 'factories/logit.js';
// var logit = Logit('color:black; background:yellow;', 'mobx:DateStore');

export const dateDisplay = dat => new XDate(dat).toString('dd MMM HH:mm');

export class DateStore {
  testing = false;
  @observable today;
  constructor(today) {
    if (today) {
      this.today = new XDate(today);
      this.testing = true;
    } else {
      this.today = new XDate();
    }
    console.log(this);
    // autorun(()=>console.warn('today is: ', this.today.toString('yyyy-MM-dd HH:mm')))
  }
  @action setNewDate = newDate => (this.today = newDate);
  @action
  datetimePlus1 = oldDate => {
    return new XDate(oldDate).addMilliseconds(1).toString('i');
  };

  dispDate(dat) {
    return new XDate(dat).toString('dd MMM HH:mm');
  }
  @computed
  get dayNo() {
    console.log('getDay', this.today.getDay(), this.today.toString('ddd'));
    return this.today.getDay();
  }
  @computed
  get todaysDate() {
    return this.today.toString('yyyy-MM-dd');
  }
  getLogTime(today = new Date()) {
    return new XDate(today).toString('i');
  }
  @computed
  get now() {
    return new XDate().toString('yyyy-MM-dd HH:mm');
  }

  @computed
  get prevDate() {
    return this.today
      .clone()
      .addDays(-55)
      .toString('yyyy-MM-dd');
  }
  @computed
  get lastAvailableDate() {
    return this.today
      .clone()
      .addDays(59)
      .toString('yyyy-MM-dd');
  }
  @computed
  get logTime() {
    return new XDate().toString('i');
  }
  datetimeIsRecent(datStr) {
    return this.datetimeIsToday(datStr);
  }
  datetimeIsToday(datStr) {
    return datStr.substr(0, 10) === this.todaysDate; // in the same day
  }
  @action
  dateMinus3Weeks(dat) {
    return new XDate(dat).addWeeks(-4).toString('yyyy-MM-dd');
  }
}

const dateStore = new DateStore();
// const dateStore = new DateStore('2017-02-09');

if (!dateStore.testing) {
  setInterval(() => {
    const newToday = new XDate();
    if (newToday.toString('yyyy-MM-dd') !== dateStore.todaysDate)
      dateStore.setNewDate(newToday);
    dateStore.setNewDate(newToday);
  }, 60000);
}

export default dateStore;
