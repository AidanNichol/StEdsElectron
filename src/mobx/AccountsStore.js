import { observable, computed, action, toJS, runInAction, autorun, reaction} from 'mobx';
import db from 'services/bookingsDB';
import XDate from 'xdate';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:AccountsStore');
import Account from './Account';

export let accountsLoading;
class AccountsStore {


  accounts = observable.map({});
  @observable activeAccountId = null;
  @observable loaded = false;
  @observable lastPaymentsBanked = ''
  @observable openingCredit = 0
  @observable openingDebt = 0;
  @observable paymentsLogsLimit;

  constructor(accounts) {
    if (accounts)this.addAccounts(accounts)
    else accountsLoading = this.loadAccounts();
    autorun(()=>{
      logit('activeAccountId set:', this.activeAccountId);
      // if (this.activeAccountId === null)debugger;
    })
    autorun(() =>  logit('autorun loaded', this.loaded));

  }

  accountsLoading: ()=>accountsLoading;

  @computed get activeAccount(){
    logit('activeAccount', this.activeAccountId, this.accounts.get(this.activeAccountId), this.accounts)
    if (!this.activeAccountId)return {};
    return this.accounts.get(this.activeAccountId);
  }

  @computed get conflictingAccounts() {
    return this.accounts.values().filter((entry)=>(entry._conflicts||[]).length > 0)
  }

  @action addAccount = account=>{
    // logit('addAccount', account)
    this.accounts.set(account._id, new Account(account,  {getAccountStore: this.getAccountStore, isLoading: ()=>!this.loaded}))
  }
  @action setActiveAccount = accId=>{
    // logit('addAccount', accId)
    this.activeAccountId = accId;
  }

  @action addAccounts = accounts=>{
    // logit('accounts', accounts)
    accounts.filter(account => account.type === 'account').map(
      account=>{
        // logit('account', account)
        return this.addAccount(account)
      }
    );
  }

  @action createNewAccount = (accId, members)=>{
    logit('createNewAccount', accId, members)
    this.addAccount({_id: accId, members});
    // this.activeAccountId = accId;
    this.accounts.get(accId).dbUpdate();
  }

  @computed get periodStartDate(){
    logit('periodStartDate', this.lastPaymentsBanked, this)
    return new XDate(this.lastPaymentsBanked).toString('ddd dd MMM')
  }

  getAccountStore = ()=>{
    const {lastPaymentsBanked, loaded} = this;
    return {lastPaymentsBanked, loaded};
  }

  @computed get allDebts() {
    logit('start allDebts', this)
    let debts=[], credits=[], payments=[];
    this.accounts.values().sort(nameCmp).forEach((account)=>{
      // ["A1182", "A608"].forEach((accId)=>{
      let debt = account.accountStatus;
      if (!debt || debt.balance < 0) debts.push(debt);
      if (!debt || debt.balance >0) credits.push(debt);
      if (debt.paymentsMade > 0) payments.push(debt);
    });
    return {debts, credits, payments};
  }
  @computed get allAccountsStatus() {
    return this.accounts.values().sort(nameCmp).map((account)=>{
      return account.accountStatus;
    })
  }

  @computed get allFixableLogs() {
    let clones={};
    this.accounts.values().forEach((account)=>{
      let logs = account.accountStatus().logs;
      if (logs)clones[account._id] = logs;
    });

    return clones;
  }

  @action changeBPdoc = (doc)=>{
    if (doc.doc)doc = doc.doc;
    this.lastPaymentsBanked = doc.endDate
    this.openingCredit = doc.closingCredit
    this.openingDebt =doc.closingDebt
    logit('changeBPdoc', doc, this.lastPaymentsBanked)
  }

  @action changeDoc = ({deleted, doc, id, ...rest})=>{
    let account = this.accounts.get(id)
    logit('changeDoc', {deleted, doc, account, id, rest})
    if (deleted){
      if (doc._rev === account._rev)this.accounts.delete(doc._id)
      if (this.activeAccountId === doc._id)this.activeAccountId = null;
      return;
    }
    if (!account){
      this.addAccount(doc);
      return;
    }
    if (doc._rev === account._rev) return; // we already know about this
    account.updateDocument(doc)
  }

  @action bankMoney = async (doc)=>{
    logit('bankMoney', doc)
    const data = await db.put(doc);
    this.changeBPdoc(doc);

  }

  @action loadAccounts = async () => {
    // const data = await db.allDocs({include_docs: true, conflicts: true, startkey: 'W', endkey: 'W9999999' });
    const dataBP = await db.allDocs({descending: true, limit: 1, include_docs: true, startkey: 'BP9999999', endkey: 'BP00000000' });
    logit('load datasummaries', dataBP)
    const data = await db.allDocs({include_docs: true, conflicts: true, startkey: 'A', endkey: 'A99999999' });
    /* required in strict mode to be allowed to update state: */
    logit('allDocs', data)
    runInAction('update state after fetching data', () => {
      if (dataBP.rows.length >  0) this.changeBPdoc(dataBP.rows[0].doc);
      this.addAccounts(data.rows.map(row=>row.doc));
      // this.activeAccountId = data.rows[0].doc._id;
      logit('AccountStore', this, this.accounts);
      this.loaded = true;
    })

    // logit('conflictingAccounts', this.conflictingAccounts)
    // for(let account of this.conflictingAccounts){
    //   // account._conflicts = account._conflicts.sort((a,b)=>getRev(b)-getRev(a))
    //   let confs = await db.get(account._id, {open_revs: account._conflicts, include_docs:true})
    //   logit('conflicting docs', confs)
    //   runInAction('addConflicting docs', ()=>{
    //     this.accounts.get(account._id).conflicts = confs.map((row)=>row.ok);
    //     logit('account:with conflicts', this.accounts.get(account._id))
    //   })
    // }
  }
}

var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

const accountsStore = new AccountsStore();
export const setActiveAccount = (memId)=>accountsStore.setActiveAccount(memId)

export default accountsStore;
export { AccountsStore };
