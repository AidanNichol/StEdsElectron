import mobx from 'mobx'
import {merge} from 'lodash'
import db from 'services/bookingsDB';
import {state} from 'ducks/replication-mobx';
import R from 'ramda';
// import {sprintf} from 'sprintf-js';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:Account');
import { observable, computed, toJS, reaction, action} from 'mobx';
import {FundsManager} from 'mobx/fundsManager';
import MS from 'mobx/MembersStore'
import WS from 'mobx/WalksStore'
import DS from 'mobx/DateStore'
import AccLog from 'mobx/AccLog';
let limit;
logit("dateStore", DS);

export default class Account {
   _id =  0;
   type='account'
  @observable _conflicts=[]
  @observable members=[]
  logs = observable.shallowMap({})
  accountId

  constructor(accountDoc, accessors) {
    merge(this, accessors);
    reaction(()=>this.logs.size, () =>  logit('autorun',this.report, this.isLoading()));
    (accountDoc.logs || []).forEach(log=>this.logs.set(log.dat, new AccLog(log)))
    delete accountDoc.logs;
    merge(this, accountDoc)
    // this.updateDocument(accountDoc);
  }

  get accountStore(){return this.getAccountStore()}

  @computed get name() {
    let nameMap = this.members.reduce((value, memId)=>{
      let mem = MS.members.get(memId) || {firstName: '????', lastName: memId};
      let lName = mem.lastName;
      value[lName] = [...(value[lName] || []), mem.firstName];
      return value;
    }, {});
    return Object.entries(nameMap).map(([lName, fName])=> `${fName.join(' & ')} ${lName}`).join(' & ');
  }

  @computed get sortname() {
    let nameMap = this.members.reduce((value, memId)=>{
      let mem = MS.members.get(memId) || {firstName: '????', lastName: memId};
      let lName = mem.lastName;
      value[lName] = [...(value[lName] || []), mem.firstName];
      return value;
    }, {});
    return Object.entries(nameMap).map(([lName, fName])=> `${lName}, ${fName.join(' & ')}`).join(' & ');
  }

  @computed get report() {
		return `Account: ${this._id} ${this.name} ${this.logs.size} ${this.logs.get(this.logs.keys().pop())}`;
	}

  @action getConflictingDocs() {
		return `Account: ${this._id} ${this.venue}`;
	}

  @action updateDocument = accountDoc=>{
    // const added = R.difference(accountDoc.logs.map(log=>log.dat), this.logs.keys());

    (accountDoc.logs || []).forEach(log=>{
      if (this.logs.has(log.dat))this.logs.get(log.dat).updateLog(log)
      else this.logs.set(log.dat, new AccLog(log));
    });
    const deleted = R.difference(this.logs.keys(), accountDoc.logs.map(log=>log.dat));
    deleted.forEach(dat=>this.logs.delete(dat))
    delete accountDoc.logs;
    merge(this, accountDoc);
    return;
  }

  @action deleteMemberFromAccount = (memId)=>{
    this.members.remove(memId);
    logit('deleteMemberFromAccount', `removing ${memId} from ${this._id}`)
    if (this.members.length === 0){
      this._deleted = true;
      logit('deleteMemberFromAccount', 'deleting account: ${this._id}')

    }
    this.dbUpdate();
  }

  @action addMemberToAccount = (memId)=>{
    this.members.push(memId);
    this.dbUpdate();
  }


  @action dbUpdate = async ()=>{
    logit('DB Update start', this)
    let {_conflicts, ...newDoc} = toJS(this);
    newDoc.logs = Object.values(newDoc.logs)
    logit('DB Update', newDoc, newDoc._deleted, _conflicts, this)
    const res = await db.put(newDoc);
    this._rev =  res.rev;
    const info = await db.info();
    logit('info', info);
    state.dbChange(info);
  }

  @action makePaymentToAccount({paymentType: req, amount, note, inFull}){
      // doer = yield select((state)=>state.signin.memberId);
      const who = 'M1180';
      var logRec = {dat:DS.logTime, who, req, type: 'A', amount, note, inFull};
      this.logs.set(logRec.dat, new AccLog(logRec));
      this.dbUpdate();
  }

  @action deletePayment(dat){
      this.logs.delete(dat);
      this.dbUpdate();
  }

  @computed get accountLogs(){
    // logit('accountLogs', this)
    return this.logs.values()
      .filter(log=>log.req!=='A' && log.req!=='S')
      .filter(log=>!limit || log.dat < limit)
      .map(log=>log.mergeableLog())
  }

  @computed get accountFrame(){
    const members = new Map(
      this.members.map(memId=>{
        return [memId, {memId, name: MS.members.get(memId).firstName}]
      })
      .sort(cmpName)
    );
    return {accId: this._id, members, sortname: this.sortname}
  }
  @computed get accountMembers(){
    return toJS(this.members.map((memId)=>{
      let mem = MS.members.get(memId);
      return {memId: memId, firstName: mem.firstName, lastName: mem.lastName, suspended: mem.suspended, subs: mem.subsStatus.status};
    }))
  }

  @computed get accountStatus() {

      var startDate = this.accountStore.lastPaymentsBanked;
    let bookingLogs = WS.allWalkLogsByAccount[this._id]||[];
    if (this.members.length === 1)bookingLogs.forEach(log=>{delete log.name})
    let logs = (this.accountLogs.concat(bookingLogs));
    // logit('accountStatus:logs', bookingLogs,logs)
    let balance = 0;
    let activeThisPeriod = false;
    let lastOK = -1;
    let lastHideable = -1
    let walkPast = 'W'+DS.now.substr(0,10);
    let currentFound = false
    // const nbsp = "\u00A0";
    let traceMe = (this._id === 'A1180' || this._id === 'A2032');

    /*------------------------------------------------------------------------*/
    /*    first pass over the data to calculate the running balance and ...   */
    /*        hideable: account in balanced and no open walks involved        */
    /*        historic: account in balanced and all walks in the past         */
    /*        resolved: account in balanced and before start of current period*/
    /*------------------------------------------------------------------------*/
    let mostRecentWalk = '';
    let lastHistory = -1
    let lastResolved = -1;
    logs = logs.sort(cmpDate).map((olog, i)=>{
      const log = R.clone(olog);
      if (i>0 && logs[i-1].dat === log.dat && log.type === 'W'){
        log.duplicate = true;
        return log;
      }
      // pass annotation and subscription logs through un altered
      if (log.req === 'A') return log;
      if (log.req === 'S') return log;

      balance -= log.amount;
      log.balance = balance;
      if (log.dat > startDate) log.activeThisPeriod = true;
      if (log.dat > startDate) activeThisPeriod = true;
      if (log.type === 'W'){
        if (log.walkId > mostRecentWalk)mostRecentWalk = log.walkId;
        if (log.walkId > walkPast)currentFound = true
      }
      if (balance === 0){
        if (mostRecentWalk <= WS.lastClosed)lastHideable = i;
        if (!log.activeThisPeriod)lastResolved = i;
        if (!currentFound) lastHistory = i;
      }

      return log;
    });

    logs = logs.map((log, i)=>( {...log, historic: (i <= lastHistory), hideable: (i <= lastHideable)}));

    /*------------------------------------------------------------------------*/
    /*    second pass over the data to work out whick walks were paid for     */
    /*    in this banking period.                                             */
    /*                                                                        */
    /*    Look at all records in this banking period back through to the last */
    /*    point were were in balance prior to the the last time we banked the */
    /*    money. If we have instance of a booking being made and cancelled    */
    /*    in this period then falg both entries so they can be ignored        */
    /*------------------------------------------------------------------------*/
    for (let i = logs.length-1; i > lastResolved; i--) {
      let log = logs[i];
      if (log.req !== 'BX')continue;
      for (let j = i-1; j > lastResolved; j--) {
        if (logs[j].req !== 'B')continue;
        if (logs[j].walkId !== log.walkId || logs[j].memId !== log.memId)continue;
        log.ignore = true;
        logs[j].billable = false;
        logs[j].ignore = true;
      }
    }
    traceMe && this.logTableToConsole(logs);
    traceMe && logit('first pass', logs, {lastHistory, lastHideable, lastResolved})

    /*------------------------------------------------------------------------*/
    /*    third pass over the data to work out whick walks were paid for      */
    /*    in this banking period and which walks still need to be paid for.   */
    /*                                                                        */
    /*    Work forward from the last resolved point gather up billable records*/
    /*    and then when funds become available either via a payment or a      */
    /*    cancellation allocate them to the walks. Once the walk is fully     */
    /*    paid it is removed from the list. Those left in the list at the end */
    /*    will still need to be paid for.                                     */
    /*                                                                        */
    /*    Note: activeThisPeriod is any log record recorded since the last    */
    /*          banking or any record affected by one of these.               */
    /*          e.g. a walk booked a while ago being paid for by new funds    */
    /*------------------------------------------------------------------------*/
    const fundsManager = new FundsManager();
    fundsManager.traceMe = (this._id === 'A1180' || this._id === 'A2032');

    for (let i = lastResolved+1; i < logs.length; i++) {
      let log = logs[i];
      // pass annotation and subscription logs through un altered
      if (log.req === 'A' || log.req === 'S' || log.duplicate) continue;

      if (log.type === 'W'){
        fundsManager.addWalk(i, log);
        if (log.req === 'BX' && !log.ignore){
          fundsManager.addCredit(i, log);
        }
        continue;
      }
      // received funds so use on previous outstanding bookings
      if (log.type === 'A'){
        fundsManager.addPayment(i, log);

      }
    }
    fundsManager.allDone(); // anything still unpaid for will flagged ast outstanding


    logs = logs
            // .map((log, i)=>({...log, historic: (i <= lastHistory), hideable: (i <= lastHideable), cloneable: (i>lastHistory && log.type === 'W' && log.walkId < walkPast && !log.clone) }))
            .filter(log=>!log.duplicate);
    // fixupAccLogs(thisAcc, logs);
    traceMe && this.logTableToConsole(logs)
    traceMe && logit('cashReceivedThisPeriod', fundsManager.cashReceivedThisPeriod, lastOK, startDate, this._id, this.name, logs)
    let debt = [];

    if (balance !== 0) debt = logs.filter((log)=>log.outstanding);
    // logit('logs final', {accId: this._id, balance, debt, logs, lastHistory, accName: this.name, sortname});
    return  {accId: this._id, balance, activeThisPeriod, available: fundsManager.available, paymentsMade: fundsManager.cashReceivedThisPeriod, debt, logs, lastHistory,  accName: this.name, sortname:this.sortname};
  }

  logTableToConsole = (logs)=>{
    console.table(logs.map(log=>R.omit(['inFull', 'note', 'accId', 'machine', 'who', 'dispDate', 'text'], log)))
  }

  @action fixupAccLogs() {
    // make sure the inFull flag in account records is set correctly
    let logs = this.getAccDebt.logs
    let newLogs = mobx.toJS(this.logs);
    let index={}, changed = false;
    for(let log of logs){
      index[log.dat] = log.balance===0;
    }
    for(let [i,log] of this.logs.entries()){
      let {dat, inFull} = log;
      if (index[dat] === inFull)continue;
      newLogs[i].inFull = index[dat]
      changed = true
    }
    var clones = logs.filter(log=>log.cloneable);
    if (clones.length>0){
      clones = clones.map(log=>{delete log.cloneable; log.clone=true; return log;})
      newLogs = newLogs.concat(clones);
      changed = true;
    }

    if (changed){
      logit('fixupAccLogs changes made', {id:this._id, old: this.logs, new: newLogs, logs})
      return newLogs.sort(logCmpDate);
    }
  }

  /*-------------------------------------------------*/
  /*                                                 */
  /*         Replication Conflicts                   */
  /*                                                 */
  /*-------------------------------------------------*/
  @computed get conflictingDocVersions(){
    return R.pluck('_rev', this.conflictingDocs)
  }
  @computed get conflictingDocs(){
    return [this, ...this.conflicts.sort((a,b)=>getRev(b._rev)-getRev(a._rev))]
  }
  @computed get conflictsByDate(){
    let revs = this.conflictingDocs;
    logit('revs', revs)
    let sum = {}
    revs.forEach((rev, i)=>{

      (rev.log||[]).forEach((lg)=>{
        let [dat, , , , req, amount] = lg;
        if (req !== 'P')return;
        if (!sum[dat])sum[dat] = R.repeat('-', revs.length);
        sum.logs[dat][i]=amount;
      })
    })
    // now filter out the OK stuff
    for(let [dat, data] of Object.entries(sum).sort(logCmpDate)){
      const dataOK = R.all((v)=> v===data[0], data);
      if (dataOK)delete sum[dat].logs[dat];
      else break;
    }

    return sum;

  }

}
const getRev = (rev)=> parseInt(rev.split('-')[0]);
var coll = new Intl.Collator();
var logCmpDate = (a, b) => coll.compare(a[0], b[0]);
const cmpName = (a, b)=>coll.compare(a.name, b.name);
var cmpDate = (a, b) => coll.compare(a.dat, b.dat);
