import { merge } from 'lodash';
import db from 'services/bookingsDB';
import { observable, computed, action, runInAction, toJS } from 'mobx';
import { replicationDbChange } from 'ducks/replication-mobx';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);

export default class Member {
  _id = 0;
  type = 'member';
  @observable memberId = 0;
  @observable accountId = 0;
  @observable firstName = '';
  @observable lastName = '';
  @observable address = '';
  @observable phone = '';
  @observable email = '';
  @observable mobile = '';
  @observable joined = '';
  @observable nextOfKin = '';
  @observable medical = '';
  @observable memberStatus = 'Guest';
  @observable suspended = false;
  @observable subscription = '';

  constructor(member) {
    // autorun(() => console.log('autorun Member', this.report, this));
    // for(let [key, val] of Object.entries(member)){
    //   this[key] = val;
    // }
    if (!member._id) {
      logit('constructor bad', member);
      return;
    }
    merge(this, member);
    this.memNo = parseInt(this._id.substr(1));
  }

  @computed
  get report() {
    return `Member: ${this._id} ${this.fullName}`;
  }
  @computed
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  @computed
  get fullNameR() {
    return `${this.lastName}, ${this.firstName}`;
  }

  shortName(account) {
    return account.members.length > 1 ? this.firstName : '';
  }

  @computed
  get subsStatus() {
    let _today = new Date();
    // DS.todaysDate;
    let status = 'ok';
    if (this.memberStatus === 'HLM') return { due: false, status, showSubsButton: false };
    if (this.memberStatus === 'Guest')
      return { due: false, status: 'guest', showSubsButton: false };

    const currentUserSubs = parseInt(this.subscription || 0);

    let fee = 15;
    // const _today = new Date();
    let thisYear = _today.getFullYear();
    // year - all new subs will be ok until the end of thie 'year'
    let year = _today >= new Date(`${thisYear}-10-01`) ? thisYear + 1 : thisYear;
    // dueSubsYear - we are collecting subs for this year
    let dueSubsYear = _today >= new Date(`${thisYear}-12-31`) ? thisYear + 1 : thisYear;
    // okSubsYear - if current value is this then you get the reduced rate.
    let okSubsYear = _today < new Date(`${thisYear}-02-01`) ? thisYear - 1 : thisYear;
    let showSubsButton =
      _today >= new Date(`${thisYear}-12-01`) && currentUserSubs < year;
    if (currentUserSubs >= okSubsYear) fee = 13;
    // console.log({currentUserSubs, year, thisYear, dueSubsYear,  okSubsYear, showSubsButton})
    if (currentUserSubs >= year || currentUserSubs >= dueSubsYear) {
      if (showSubsButton) return { due: false, status, year, fee, showSubsButton };
      else return { due: false, status, showSubsButton };
    }
    status = 'due';
    if (currentUserSubs >= okSubsYear) fee = 13;
    else status = 'late';
    showSubsButton = true;
    return { due: true, year, fee, status, showSubsButton };
  }

  @action
  updateField = (field, value) => {
    this[field] = value;
  };
  @action
  updateDocument = member => {
    merge(this, member);
    return;
  };

  @action
  dbUpdate = async () => {
    let { _conflicts, ...newDoc } = toJS(this); // eslint-disable-line no-unused-vars
    logit('DB Update', newDoc._deleted, newDoc);
    const res = await db.put(newDoc);
    runInAction('after doc update', () => {
      this._rev = res.rev;
    });
    const info = await db.info();
    logit('info', info);
    replicationDbChange('member changed');
  };
}
