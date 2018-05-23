const { observable, computed, action, runInAction, autorun } = require('mobx');
const db = require('services/bookingsDB');
const _ = require('lodash');
const Logit = require('factories/logit.js');
var logit = Logit(__filename);
const Account = require('./Account');

// export let accountsLoading;
class AccountsStore {
  accounts = observable.map({});
  @observable activeAccountId = null;
  @observable loaded = false;
  // @observable lastPaymentsBanked = '';
  // @observable openingCredit = 0;
  // @observable openingDebt = 0;
  // @observable paymentsLogsLimit;
  // @observable currentPeriodStart;
  // previousUnclearedBookings;
  constructor(accounts) {
    if (accounts) this.addAccounts(accounts);
    // else accountsLoading = this.loadAccounts();
    autorun(() => {
      logit('activeAccountId set:', this.activeAccountId);
      // if (this.activeAccountId === null)debugger;
    });
    autorun(() => logit('autorun loaded', this.loaded));
  }

  // accountsLoading: () => accountsLoading;

  @computed
  get activeAccount() {
    logit(
      'activeAccount',
      this.activeAccountId,
      this.accounts.get(this.activeAccountId),
      this.accounts,
    );
    if (!this.activeAccountId) return {};
    return this.accounts.get(this.activeAccountId);
  }

  @computed
  get conflictingAccounts() {
    return this.accounts.values().filter(entry => (entry._conflicts || []).length > 0);
  }

  @action
  addAccount = account => {
    // logit('addAccount', account)
    this.accounts.set(
      account._id,
      new Account(account, {
        getAccountStore: this.getAccountStore,
        isLoading: () => !this.loaded,
      }),
    );
  };
  @action
  setActiveAccount = accId => {
    // logit('addAccount', accId)
    this.activeAccountId = accId;
  };

  @action
  addAccounts = accounts => {
    // logit('accounts', accounts)
    accounts.filter(account => account.type === 'account').map(account => {
      // logit('account', account)
      return this.addAccount(account);
    });
  };

  @action
  createNewAccount = (accId, members) => {
    logit('createNewAccount', accId, members);
    this.addAccount({ _id: accId, members });
    // this.activeAccountId = accId;
    this.accounts.get(accId).dbUpdate();
  };

  // @computed
  // get periodStartDate() {
  //   logit('periodStartDate', this.lastPaymentsBanked, this);
  //   return new XDate(this.lastPaymentsBanked).toString('ddd dd MMM');
  // }

  getAccountStore = () => {
    const { loaded, activeAccountId } = this;
    return { loaded, activeAccountId };
  };

  unclearedBookings(dat) {
    logit('unclearedBookings', dat, this);
    let bookings = {};
    this.accounts.values().forEach(account => {
      // ["A1182", "A608"].forEach((accId)=>{
      let logs = account.unclearedBookings(dat);

      if (logs.length > 0) bookings[account._id] = logs;
    });
    return bookings;
  }

  @computed
  get allDebts() {
    logit('start allDebts', this);
    let debts = [],
      credits = [],
      payments = [];
    this.accounts
      .values()
      .sort(nameCmp)
      .forEach(account => {
        // ["A1182", "A608"].forEach((accId)=>{
        let debt = account.accountStatus;
        if (!debt || debt.balance < 0) debts.push(debt);
        if (!debt || debt.balance > 0) credits.push(debt);
        if (debt.paymentsMade > 0) payments.push(debt);
      });
    return { debts, credits, payments };
  }
  @computed
  get allAccountsStatus() {
    return this.accounts
      .values()
      .sort(nameCmp)
      .map(account => {
        return account.accountStatus;
      });
  }
  fixupAllAccounts() {
    this.accounts.values().forEach(acc => {
      let logs = acc.accountStatus.logs;
      acc.fixupAccLogs(logs);
    });
  }

  // @computed
  // get allFixableLogs() {
  //   let clones = {};
  //   this.accounts.values().forEach(account => {
  //     let logs = account.accountStatus().logs;
  //     if (logs) clones[account._id] = logs;
  //   });
  //
  //   return clones;
  // }

  // @action
  // changeBPdoc = doc => {
  //   if (doc.doc) doc = doc.doc;
  //   this.lastPaymentsBanked = doc.endDate;
  //   this.openingCredit = doc.closingCredit;
  //   this.openingDebt = doc.closingDebt;
  //   this.currentPeriodStart = doc.currentPeriodStart;
  //   this.previousUnclearedBookings = doc.unclearedBookings;
  //   logit('changeBPdoc', doc, this.lastPaymentsBanked, this.currentPeriodStart);
  // };

  /*------------------------------------------------------------------------*/
  /* replication has a new or changed account document                      */
  /*------------------------------------------------------------------------*/
  @action
  changeDoc = ({ deleted, doc, id, ...rest }) => {
    let account = this.accounts.get(id);
    logit('changeDoc', { deleted, doc, account, id, rest });
    if (deleted) {
      if (account && doc._rev === account._rev) this.accounts.delete(doc._id);
      if (this.activeAccountId === doc._id) this.activeAccountId = null;
      return;
    }
    if (!account) {
      this.addAccount(doc);
      return;
    }
    if (doc._rev === account._rev) return; // we already know about this
    account.updateDocument(doc);
  };

  // @action
  // bankMoney = async doc => {
  //   logit('bankMoney', doc);
  //   await db.put(doc);
  //   this.changeBPdoc(doc);
  // };

  @action
  async init() {
    //load accounts
    // const data = await db.allDocs({include_docs: true, conflicts: true, startkey: 'W', endkey: 'W9999999' });
    // const dataBP = await db.allDocs({
    //   descending: true,
    //   limit: 1,
    //   include_docs: true,
    //   startkey: 'BP9999999',
    //   endkey: 'BP00000000'
    // });
    // logit('load datasummaries', dataBP);
    const data = await db.allDocs({
      include_docs: true,
      conflicts: true,
      startkey: 'A',
      endkey: 'A99999999',
    });
    /* required in strict mode to be allowed to update state: */
    logit('allDocs', data);
    runInAction('update state after fetching data', () => {
      // if (dataBP.rows.length > 0) this.changeBPdoc(dataBP.rows[0].doc);
      this.addAccounts(data.rows.map(row => row.doc));
      // this.activeAccountId = data.rows[0].doc._id;
      logit('AccountStore', this, this.accounts);
      this.loaded = true;
    });
    logit('conflictingAccounts', this.conflictingAccounts);
    for (let conflictedAccount of this.conflictingAccounts) {
      // if (conflictedAccount._id !== 'A295') break;
      // conflictedAccount._conflicts = conflictedAccount._conflicts.sort((a,b)=>getRev(b)-getRev(a))

      let confs = await db.get(conflictedAccount._id, {
        open_revs: conflictedAccount._conflicts,
        include_docs: true,
      });
      // logit('conflicting docs', confs);
      runInAction('addConflicting docs', () => {
        let account = this.accounts.get(conflictedAccount._id);
        // account.conflicts = confs.map(row => row.ok);
        confs.forEach(row => {
          let added = this.compareLogs(account.logs, row.ok.logs);
          if (!_.isEmpty(added)) {
            logit(
              'Conflicts',
              account._id,
              row.ok._rev,
              account.name,
              '\n',
              JSON.stringify(added),
            );
          }
          account.insertPaymentsFromConflictingDoc(added);
        });
        // logit('account:with conflicts', this.accounts.get(account._id));
      });
    }
  }
  compareLogs = (okLogs, confLogs) => {
    if (!confLogs) return;
    let added = {};
    for (let conf of confLogs) {
      let okLog = okLogs.get(conf.dat);
      if (!okLog) added[conf.dat] = conf;
      // var diff = _.omitBy(okLog, function(v, k) {
      //   // console.log('k,v,last[k] = ' + k + ',' + v + ',' + last[k]);
      //   return k === 'inFull' || conf[k] === v;
      // });
      // if (!_.isEmpty(diff)) added[conf.dat] = 'chngd: ' + JSON.stringify(diff);
    }
    return added;
  };
}

var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

const accountsStore = new AccountsStore();
// export const setActiveAccount = memId => accountsStore.setActiveAccount(memId);

module.exports = accountsStore;
// export { AccountsStore };
