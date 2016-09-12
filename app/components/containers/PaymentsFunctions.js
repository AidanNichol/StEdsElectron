// import React from 'react';
import { createSelector } from 'reselect'
import {request} from 'ducks/walksDuck'
// import Immutable from 'seamless-immutable';
import * as i from 'icepick';
import XDate from 'xdate';
import {getTodaysDate} from 'utilities/DateUtilities';
var _today = getTodaysDate();
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'PaymentsFunctions');


var membersNames = i.freeze({});
// var membersNames = Immutable({});
const getMemberNames = createSelector(
  (state)=>state.members,
  (state)=>state.accounts.list,
  (members, accounts)=>{
    let oldResult = membersNames;
    Object.keys(members).forEach((memId)=>{
      let accId = members[memId].accountId;
      let name = accounts[accId].members.length > 1 ? members[memId].firstName : '';
      membersNames = i.set(membersNames, 'memId', name);// setting to existing value is ignored
    });
    logit('getMemberNames', oldResult === membersNames, {oldResult, membersNames});
    return membersNames;
  }
);

var _getWalkLogs = [];
var _acc = {};
var _walkData = {};

const tranformLogRec = (logObj, memNames)=>{
  let venue = logObj.walkId ? _walkData[logObj.walkId].venue : '';
  // if (!logObj.amount) logObj.amount = _walkData[logObj.walkId].fee * request.chargeFactor(logObj.req);
  logObj.amount = (logObj.amount || _walkData[logObj.walkId].fee) * request.chargeFactor(logObj.req);
  // else logObj.amount *= -1;
  let name = logObj.memId ? memNames[logObj.memId] : '';
  logObj.dispDate = new XDate(logObj.dat).toString('dd MMM HH:mm');
  let text = logObj.text && logObj.text.length > 0 ? `(${logObj.text})` : ''
  logObj.text = (logObj.req==='P' ? logObj.note || '' : ` ${name} ${venue} ${text}`);
  // logObj.text = request.names[logObj.req] + (logObj.req==='P' ? '' : ` ${name} ${venue}`);
  return logObj;
};

const makeGetWalkLogs = (walkId) => createSelector(
    (state)=>state.walks.list[walkId],
    getMemberNames,
    (walk, memNames)=>{
      let map = {};
      (walk.log||[]).forEach((log)=>{
        let [dat, who, memId, req, text] = log;
        if (!map[memId])map[memId] = [];
        map[memId].push(tranformLogRec({dat, who, memId, req, walkId, text}, memNames));
      });
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
    (state)=>(state.accounts.list[accId] && state.accounts.list[accId].log) || emptyLog ,
    getMemberNames,
    (accLog, memNames)=>{
      let aLogs = accLog.asMutable ? accLog.asMutable() : [...accLog];
      logit('getAccountLogs '+accId, {accLog})
      aLogs = aLogs.filter((lg)=>lg[4]!=='P' || (lg[5]!==null && lg[5]!==0))
        .map((log)=>{
          let [dat, who, walkId, memId, req, amount, note] = log;
          return tranformLogRec({dat, who, walkId, memId, req, amount, note}, memNames);
      });
      logit('getAccountLogs '+accId, aLogs);
      return aLogs;
    });

const makeGetAccountDebt = (accId)=> createSelector(
  getCombinedWalkLogs,
  (state)=>_acc[accId].getLog(state),
  (state)=>state.accounts.list[accId] || {members:[]},
  (state)=>getAccountName(state.accounts.list[accId], state.members),
  (state)=>state.members || {},
  (wLogs, aLogs, thisAcc, accName, members)=>{
    if (thisAcc.members.length===0 || !members[thisAcc.members[0]])return;
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
    logs = logs.sort(logCmp).map((log, i)=>{
      // logs = logs.map((log, i)=>{
      balance -= log.amount;
      // logit('log '+accId, {log, balance});
      if (!currentFound && log.req !== 'P' && log.walkId > walkPast)currentFound = true
      if (!currentFound && balance === 0)lastHistory = i;
      if (balance >= 0) lastOK = i;
      return {...log, balance};
    });
    logs = logs.map((log, i)=>({...log, historic: (i <= lastHistory) }));
    let debt = [];
    if (balance < 0){
      debt = logs
        .slice(lastOK+1)
        .map((log, i, arr)=>{
          log.outstanding = request.billable(log.req);
          let cancelled = arr.slice(i+1).filter((l)=>l.req.length>1 && l.req[1]==='X' && l.memId === log.memId && l.walkId===log.walkId).length > 0
          log.outstanding = log.outstanding && !cancelled
          let owing = Math.min(-log.amount, -balance);
          // logit('logs '+accId, {logs, balance, lastOK, owing});
          return {...log, owing};
        })
        .filter((log)=>log.req==='B' || log.req==='L');
    }
    // logit('logs '+accId, {balance, debt, logs, accName, sortname});
    return  {accId, balance, debt, logs, accName, sortname};
}
);

var logColl = new Intl.Collator();
var logCmp = (a, b) => logColl.compare(a.dat, b.dat);

// get the names of the members on this account
const getAccountName = (accountDoc, members)=>{
  if (!accountDoc || !accountDoc.members)return '????';
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
  logit('create _getWalkLogs', _getWalkLogs);
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
  let debts=[];
  Object.keys(state.accounts.list).forEach((accId)=>{
    // ["A1182", "A608"].forEach((accId)=>{
    let debt = getAccDebt(accId, state);
    if (!debt || debt.balance < 0) debts.push(debt);
  });

  var nameColl = new Intl.Collator();
  var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

  debts = debts.sort(nameCmp);
  logit('debts', debts);
  return debts;
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
