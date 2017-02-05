import mobx from 'mobx'
import {request} from 'ducks/walksDuck'
import {merge} from 'lodash'
import db from 'services/bookingsDB';
import {state} from 'ducks/replication-mobx';
import {remove} from 'lodash';
import R from 'ramda';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:Account');
import { observable, computed, toJS, reaction, action} from 'mobx';
import MS from 'mobx/MembersStore'
import WS from 'mobx/WalksStore'
import DS from 'mobx/DateStore'
import {dateDisplay} from 'mobx/DateStore'

let limit;
logit("dateStore", DS);


export class AccLog{
  dat;
  who;
  machine;
  req='';
  amount = 0;
  note='';

  mergeableLog = ()=>{
    let amount = this.amount * request.chargeFactor(this.req);
    return {...this, amount, dispDate: dateDisplay(this.dat), text: this.note, type: 'A'};
  }

  constructor(log){
    this.updateLog(log);
    // merge(this, log)
  }

  @action updateLog = (data) => {merge(this, data)}
}

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
    var startDate = this.getLastPaymentsBanked();
    let bookingLogs = WS.allWalkLogsByAccount[this._id]||[];
    if (this.members.length === 1)bookingLogs.forEach(log=>{delete log.name})
    let logs = (this.accountLogs.concat(bookingLogs));
    // logit('accountStatus:logs', bookingLogs,logs)
    let balance = 0;
    let cashReceivedThisPeriod = 0;
    let cashAvailable = 0;
    let activeThisPeriod = false;
    let lastOK = -1;
    let lastHistory = -1
    let lastHideable = -1
    let walkPast = 'W'+DS.now.substr(0,10);
    let currentFound = false
    let mostRecentWalk = '';
    // let zeroPoints = [-1]
    // let lastZeroPoint = -1;
    let latestOKbooking = -1;
    let paid;
    logs = logs.sort(cmpDate).map((log, i)=>{
      if (i>0 && logs[i-1].dat === log.dat && log.type === 'W'){
        log.duplicate = true;
        return log;
      }
      // pass annotation and subscription logs through un altered
      if (log.req === 'A') {logit('A req', log);return log;}
      if (log.req === 'S') {logit('S req', log);return log;}
      // if credits then use on this walk
      if (balance > 0 && log.type === 'W' && log.billable){
        paid = Math.min(balance - cashAvailable, Math.abs(log.owing));
        log.paid['+'] += paid;
        log.owing -= paid;
        paid = Math.min(cashAvailable, Math.abs(log.owing));
        log.paid.P += paid;
        log.owing -= paid;
        if (log.owing === 0)log.outstanding = false;
      }
      balance -= log.amount;
      log.balance = balance;
      // logit('log '+accId, {log, balance});
      if (log.dat > startDate){
        activeThisPeriod = true;
        log.activeThisPeriod = true;
      }
      if (log.type === 'W'){
        if (!currentFound && log.type === 'W'){
          if (log.walkId > mostRecentWalk)mostRecentWalk = log.walkId;
          if (log.walkId > walkPast)currentFound = true
        }
        if (log.billable){
          if (balance < 0 && !log.cancelled && log.amount > 0) log.outstanding = true;
          else latestOKbooking = i;
        }
      }
      // received funds so use on previous outstanding bookings
      if (log.type === 'A' && log.req != 'A'){
        let available = Math.abs(log.amount) * (log.req.length > 1? -1 : 1);
        if (log.dat > startDate && log.req[0] === 'P'){
          cashAvailable += available;
          cashReceivedThisPeriod += available;
        }
        if (this._id === 'A2039')logit('logs accountType '+this._id, {i, latestOKbooking, available, activeThisPeriod});
        for (var j = latestOKbooking+1; j < i; j++) {
          let logB = logs[j];
          if (this._id === 'A2039')logit('checking walk '+this._id, {j, type: logB.type,owing: logB.owing, available});
          if (logB.type !== 'W' || logB.owing <= 0 || available <= 0)continue;
          if (this._id === 'A2039')logit('logs paid '+this._id, {j, type: logB.type, logB, cashAvailable});
          paid = Math.min(Math.abs(available), Math.abs(logB.owing));
          available -= paid;
          logB.owing -= paid;
          logB.paid[log.req] += paid;
          if (logB.owing === 0){
            logB.outstanding = false;
            latestOKbooking = j;
          }
          if (activeThisPeriod){
            logB.activeThisPeriod = true;
            if (log.req[0] === 'P')cashAvailable -= paid;
          }

        }
      }
      if (!currentFound && balance === 0){
        lastHistory = i;
        log.mostRecentWalk = mostRecentWalk;
        if (mostRecentWalk <= WS.lastClosed)lastHideable = i;
      }
      if (balance >= 0 && log.dat < startDate) lastOK = i;
      if (this._id === 'A2039')logit('logs done '+this._id, {i, log,latestOKbooking, cashReceivedThisPeriod});

      return log;
      // return {...log, zeroPoint: balance === 0, balance};
    });
    logs = logs
            .map((log, i)=>({...log, historic: (i <= lastHistory), hideable: (i <= lastHideable), cloneable: (i>lastHistory && log.type === 'W' && log.walkId < walkPast && !log.clone) }))
            .filter(log=>!log.duplicate);
    // fixupAccLogs(thisAcc, logs);
    if (this._id === 'A2039')logit('cashReceivedThisPeriod', cashReceivedThisPeriod, lastOK, startDate, this._id, this.name, logs)
    let debt = [];
    // if (balance < 0 || cashReceivedThisPeriod){
    //   let due = balance;
    //   if (this._id === 'A2039') logit('getdebt', balance, logs, lastOK, cashReceivedThisPeriod)
    //   logs = logs
    //     .reverse()
    //     .map((log, i)=>{
    //       if (i>=logs.length-lastOK-1)return log;
    //       // if (balance === 0)hitBalancePoint = true;
    //       if (due < 0 && log.amount > 0 && request.billable(log.req)){
    //
    //         log.outstanding = !log.cancelled
    //         if (!log.cancelled) due += Math.min(-due, log.amount)
    //
    //       }
    //       else log.outstanding = false;
    //       if (log.type==='W' && cashReceivedThisPeriod > 0 && !log.outstanding
    //           && log.req.length === 1 && !log.cancelled){
    //         log.paid = Math.min(Math.abs(cashReceivedThisPeriod), Math.abs(log.amount));
    //         cashReceivedThisPeriod -= log.paid;
    //         if (this._id === 'A2039')logit('logs paid '+this._id, {i, log, cashReceivedThisPeriod});
    //       }
    //       if (this._id === 'A2039')logit('getdebt log', due, log)
    //       let owing = Math.min(-log.amount, -balance);
    //       if (this._id === 'A2039')logit('logs '+this._id, {i, logs, balance, owing, cashReceivedThisPeriod});
    //       return {...log, owing};
    //     })
    //     .reverse() ;
    // }
    if (balance !== 0) debt = logs.slice(lastOK+1).filter((log)=>log.outstanding);
    // logit('logs final', {accId: this._id, balance, debt, logs, lastHistory, accName: this.name, sortname});
    return  {accId: this._id, balance, activeThisPeriod, paymentsMade: cashReceivedThisPeriod, debt, logs, lastHistory, extraCash: cashAvailable, accName: this.name, sortname:this.sortname};
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
