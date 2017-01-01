// import React from 'react';
import { createSelector } from 'reselect'
import {request} from 'ducks/walksDuck'
import * as i from 'icepick';
import XDate from 'xdate';
import {getTodaysDate} from 'utilities/DateUtilities.js';
var _today = getTodaysDate();
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Functions');
// var limit;
// limit = '2016-11-04T23:00:00';
// limit = '2016-11-06T23:00:00';
// limit = '2016-11-18T09:00:00';
// limit = '2016-11-21T09:00:00';
// limit = '2016-12-01T09:27:24';

var membersNames = i.freeze({});
// var membersNames = Immutable({});
const getMemberNames = createSelector(
  (state)=>state.members,
  (state)=>state.accounts.list,
  (members, accounts)=>{
    let oldResult = membersNames;
    Object.keys(members).forEach((memId)=>{
      let accId = members[memId].accountId;
      let name = accounts && accounts[accId] && accounts[accId].members.length > 1 ? members[memId].firstName : '';
      membersNames = i.set(membersNames, memId, name);// setting to existing value is ignored
    });
    logit('getMemberNames', oldResult === membersNames, {oldResult, membersNames});
    return membersNames;
  }
);

export const getWalkLogsByDate = createSelector(
  (state)=>state.walks.list,
  (state)=>state.members,
  (state, startDate)=>startDate,
  (state, startDate, endDate)=>endDate,
  (walks, members, startDate, endDate)=>{
    logit('getWalkLogsByDate:start', {walks, members, startDate, endDate})
    let logs = [];
    for(let walkId of Object.keys(walks)){
      let walk = walks[walkId];
      for(let memId of Object.keys(walks[walkId].bookings)||[]){
        let forefited = false;
        for(let log of walks[walkId].bookings[memId].logs||[]){
          if (startDate && (log.dat < startDate) )continue;
          if (endDate && (log.dat > endDate) )continue;
          if (log.req === 'A')continue;

          log = {...log, walkId: walk.walkId, memId, type:'W'};
          log.amount = Math.abs((walk.fee || 8) * request.chargeFactor(log.req));
          if (log.req === 'BL')forefited = true;
          else if (forefited) log.amount = 0;
          log.name = members[log.memId].firstName+' '+members[log.memId].lastName
          log.dispDate = new XDate(log.dat).toString('dd MMM HH:mm');
          let text = log.note && log.note.length > 0 ? `(${log.note})` : ''
          log.text = ` ${walk.venue} ${text}`;
          logs.push(log);
        }
      }
    }
    logit('_getWalkLogsByDate ', logs);
    return logs.sort(logCmpDate);
  }
);

export const getAccountLogByDateAndType = createSelector(
  (state)=>state.accounts.list || {} ,
  (state)=>state.members,
  (state, startDate)=>startDate,
  (state, startDate, endDate)=>endDate,
  (accs, members, startDate, endDate)=>{
    let logs = []
    logit('getAccountLogsByDateAndType', {accs, members, startDate, endDate})
    Object.keys(accs).forEach((acc)=>{
      (accs[acc].logs||[]).forEach((log)=>{
        if (startDate && (log.dat < startDate) )return;
        if (endDate && (log.dat > endDate) )return;
        if (log.type !== 'A' || log.req === 'S') return;
        if (log.type && log.type !== 'A') return log;
        log= {...log, type: 'A'}
        log.name = getAccountName(accs[acc], members);
        // log = i.thaw(log);
        log.amount = Math.abs(log.amount * request.chargeFactor(log.req));
        log.dispDate = new XDate(log.dat).toString('dd MMM HH:mm');
        log.text = log.note || ''
        logs.push(expandAccLogRec(log));
      });
    });
    logit('getAccountLogsByDateAndType ', logs);
    return logs.sort(logCmpDate);
  }
);



var _getWalkLogs = [];
var _acc = {};
var _walkData = {};

const expandAccLogRec = (log)=>{
  if (log.type !== 'A') return log;
  // log = i.thaw(log);
  log.amount = log.amount * request.chargeFactor(log.req);
  // log.name = log.memId ? memNames[log.memId] : '';
  log.dispDate = new XDate(log.dat).toString('dd MMM HH:mm');
  // let text = log.text && log.text.length > 0 ? `(${log.text})` : ''
  log.text = log.note || ''

  return log;
};

const makeGetWalkLogs = (walkId) => createSelector(
    (state)=>state.walks.list[walkId],
    getMemberNames,
    (state)=>state.paymentsSummary.paymentsLogsLimit,
    (walk, memNames, limit)=>{
      logit('_getWalkLogs:start', {walk,limit})
      let map = {};
      for(let memId of Object.keys(walk.bookings)){
        map[memId] = [];
        let forefited = false;
        for(let log of walk.bookings[memId].logs||[]){
          if (limit && log.dat >= limit) continue;
          log = {...log, walkId: walk.walkId, memId, type:'W'};
          log.amount = (walk.fee || 8) * request.chargeFactor(log.req);
          if (log.req === 'BL')forefited = true;
          else if (forefited) log.amount = 0;
          log.name = log.memId ? memNames[log.memId] : '';
          log.dispDate = new XDate(log.dat).toString('dd MMM HH:mm');
          let text = log.note && log.note.length > 0 ? `(${log.note})` : ''
          log.text = ` ${walk.venue} ${text}`;
          map[memId].push(log);
        }
      }
      logit('_getWalkLogs '+walk.walkId, map);
      return map;
});

var getCombinedWalkLogs;
const makeGetCombinedWalkLogs = ()=>createSelector(
  ..._getWalkLogs,
  (...maps)=>{
    let map={};
    maps.forEach((walkmap)=>{
      // logit('walkMap', walkmap);
      Object.keys(walkmap).forEach((memId)=>{
        if (!map[memId])map[memId] = [];
        map[memId] = [...(map[memId] || []), ...(walkmap[memId] || [])];

      })
    });
    logit('getCombinedWalkLogs', map);
    return map;
  }
);
const emptyLog = [];
const makeGetAccountLog = (accId)=> createSelector(
    (state)=>i.thaw((state.accounts.list[accId] && state.accounts.list[accId].logs) || emptyLog) ,
    getMemberNames,
    (state)=>state.paymentsSummary.paymentsLogsLimit,
    (accLog, memNames, limit)=>{
      let aLogs = accLog.asMutable ? accLog.asMutable() : [...accLog];
      if (typeof aLogs === 'object')aLogs = Object.values(aLogs);
      // logit('getAccountLogs '+accId, {accLog})
      let logs = [];
      for (let log of i.thaw(aLogs)){
        if ((log.type==='W' || log.req==='A') && !log.amount) continue; // ignore zero payments
        if (log.req === 'S') continue; // ignore subscriptions
        if (limit && log.dat >= limit) continue;
        if (log.type === 'A'){
          // log = i.thaw(log);
          log.amount = log.amount * request.chargeFactor(log.req);
          log.name = log.memId ? memNames[log.memId] : '';
          log.dispDate = new XDate(log.dat).toString('dd MMM HH:mm');
          // let text = log.text && log.text.length > 0 ? `(${log.text})` : ''
          log.text = log.note || ''
        }
        logs.push(log);
      }
      return logs;
    });

const makeGetAccountDebt = (accId)=> createSelector(
  getCombinedWalkLogs,
  (state)=>_acc[accId].getLog(state),
  (state)=>state.accounts.list[accId] || {members:[]},
  (state)=>getAccountName(state.accounts.list[accId], state.members),
  (state)=>state.members || {},
  (wLogs, aLogs, thisAcc, accName, members)=>{
    if (thisAcc.members.length===0 || !members[thisAcc.members[0]])
    {
      console.error('bad Acount record', thisAcc, members)
      return;
    }
    // logit('account '+accId, thisAcc);
    let logs = aLogs;
    let sortname;
    thisAcc.members.forEach((memId)=>{
      sortname = `${members[memId].lastName}, ${members[memId].firstName}`;
      logs = logs.concat(wLogs[memId] || []);
    });
    // let accName = getAccountName(thisAcc, store.members);
    // logit('logs '+accId, logs);
    let balance = 0;
    let lastOK = -1;
    let lastHistory = -1
    let walkPast = 'W'+_today
    let currentFound = false
    let zeroPoints = [-1]
    let lastZeroPoint = -1;
    logs = i.thaw(logs).sort(logCmpDate).map((log, i)=>{
      // logs = logs.map((log, i)=>{
      if (i>0 && logs[i-1].dat === log.dat && log.type === 'W')log.duplicate = true
      else balance -= log.amount;
      // logit('log '+accId, {log, balance});
      if (!currentFound && log.type === 'W' && log.walkId > walkPast)currentFound = true
      if (!currentFound && balance === 0)lastHistory = i;
      if (log.type === 'A' && balance === 0){
        zeroPoints.push(i);
        lastZeroPoint = i;
      }
      if (balance >= 0) lastOK = i;
      return {...log, zeroPoint: balance === 0, balance};
    });
    logs = logs
            .map((log, i)=>({...log, historic: (i <= lastHistory), cloneable: (i>lastHistory && log.type === 'W' && log.walkId < walkPast && !log.clone) }))
            .filter(log=>!log.duplicate);
    let debt = [];
    if (balance < 0){
      let due = balance;
      // logit('getdebt', balance, logs)
      debt = logs
        .slice(lastOK+1)
        .reverse()
        .map((log, i, arr)=>{
          if (due < 0 && request.billable(log.req)){
            let cancelled = arr.slice(0,i).filter((l)=>{
              return l.req.length>1 && l.req[1]==='X' && l.memId === log.memId && l.walkId===log.walkId
            }).length > 0
            log.outstanding = !cancelled
            if (!cancelled) due += Math.min(-due, log.amount)

          }
          else log.outstanding = false;
          // logit('getdebt log', due, log)
          let owing = Math.min(-log.amount, -balance);
          // logit('logs '+accId, {logs, balance, lastOK, owing});
          return {...log, owing};
        })
        .reverse()
        .filter((log)=>log.req==='B' || log.req==='C' || log.req==='L');
    }
    // logit('logs '+accId, {balance, debt, logs, accName, sortname});
    return  {accId, balance, debt, logs, lastHistory, zeroPoints,lastZeroPoint, accName, sortname};
}
);

var logColl = new Intl.Collator();
// var logCmpDate = (a, b) => logColl.compare(a.dat, b.dat);
var logCmpDate = (a, b) => {
  let res = logColl.compare(a.dat, b.dat);
  if (res === 0) res = logColl.compare(a.type, b.type);
  return res;
}

// get the names of the members on this account
const getAccountName = (accountDoc, members)=>{
  if (!accountDoc || !accountDoc.members || !accountDoc.members.reduce){
    logit('bad accountDoc', accountDoc);
    return '????';}
  let nameMap = accountDoc.members.reduce((value, memId)=>{
    let mem = members[memId] || {firstName: '????', lastName: memId};
    let lName = mem.lastName;
    value[lName] = [...(value[lName] || []), mem.firstName];
    return value;
  }, {});
  return Object.keys(nameMap).map((sName)=> nameMap[sName].join(' & ')+' '+sName).join(' & ');
};

const getWalkLogs = (state)=>{
  // members = state.members;
  if (_getWalkLogs.length!==0) return;

  Object.keys(state.walks.list).forEach((walkId)=>{
    _getWalkLogs.push(makeGetWalkLogs(walkId));
    _walkData[walkId] = {venue: state.walks.list[walkId].venue.replace(/\(.*\)/, ''), fee: state.walks.list[walkId].fee};
  });
  getCombinedWalkLogs = makeGetCombinedWalkLogs();
  // logit('create _getWalkLogs', _getWalkLogs);
};

export const getAccDebt = (accId, state)=>{
  getWalkLogs(state);
  if (!accId)return {};
  if (!_acc[accId]){
    _acc[accId] = {};
    _acc[accId].getLog = makeGetAccountLog(accId);
    _acc[accId].getDebt = makeGetAccountDebt(accId);
  }
  return _acc[accId].getDebt(state);
};

export const getAllDebts = (state)=>{
  let debts=[], credits=[];
  Object.keys(state.accounts.list).forEach((accId)=>{
    // ["A1182", "A608"].forEach((accId)=>{
    let debt = getAccDebt(accId, state);
    if (!debt || debt.balance < 0) debts.push(debt);
    if (!debt || debt.balance >0) credits.push(debt);
  });

  var nameColl = new Intl.Collator();
  var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

  debts = debts.sort(nameCmp);
  // logit('debts', debts);
  return {debts, credits};
};

export const getAllCloneables = (state)=>{
  let clones={};
  Object.keys(state.accounts.list).forEach((accId)=>{
  // ["A989", "A2008", 'A2009', 'A1158'].forEach((accId)=>{
    let clone = getAccDebt(accId, state).logs;
    clone = clone.filter(log=>log.cloneable);
    if (clone.length>0)clones[accId] = clone;
  });

  return clones;
};



export const showStats = ()=>{
  if (_getWalkLogs.length===0)return;
  var table = {
    // getMemberNames : getMemberNames.recomputations(),
    getCombinedWalkLogs : [getCombinedWalkLogs.recomputations(), 0],
    getMemberNames : [getMemberNames.recomputations(), 0],
  }
  Object.keys(_getWalkLogs).map((key)=>{table[key] = [_getWalkLogs[key].recomputations(), 0];})
  Object.keys(_acc).map((key)=>{table[key] = [_acc[key].getLog.recomputations(), _acc[key].getDebt.recomputations()];})
  console.groupCollapsed('reselect');
  console.table(table);
  console.groupEnd('reselect');
}
