// import React from 'react';
import { createSelector } from 'reselect'
import {request} from 'ducks/walksDuck'
import * as i from 'icepick';
import XDate from 'xdate';
import {getTodaysDate} from 'utilities/DateUtilities.js';
var _today = getTodaysDate();
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Functions');
var limit;
// limit = '2016-11-04T23:00:00';
// limit = '2016-11-06T23:00:00';
// limit = '2016-11-18T09:00:00';
// limit = '2016-11-21T09:00:00';

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
    let logs = [];
    Object.keys(walks).forEach((walk)=>{
      (walks[walk].log||[]).forEach((log)=>{
        let [dat, who, memId, req, text] = log;
        if (startDate && (dat < startDate) )return;
        if (endDate && (dat > endDate) )return;
        if (req === 'A')return;
        let amount =  Math.abs((_walkData[walk] ? _walkData[walk].fee || 8 : 8) * request.chargeFactor(req));
        logs.push(tranformSummaryLogRec({dat, who, memId, req, amount, walkId: walk, text}, members));
      });

    });
    logit('_getWalkLogsByDate ', logs);
    return logs.sort(logCmp);
  }
);

export const getAccountLogByDateAndType = createSelector(
  (state)=>state.accounts.list || {} ,
  (state)=>state.members,
  (state, startDate)=>startDate,
  (state, startDate, endDate)=>endDate,
  (state, startDate, endDate, reqType)=>reqType,
  (accs, members, startDate, endDate, reqType)=>{
    let logs = []
    logit('getAccountLogsByDateAndType', {accs, members, startDate, endDate, reqType})
    Object.keys(accs).forEach((acc)=>{
      (accs[acc].log||[]).forEach((log)=>{
        let [dat, who, walkId, memId, req, amount, note] = log;
        if (startDate && (dat < startDate) )return;
        if (endDate && (dat > endDate) )return;
        if (req !== reqType) return;
        if (note && note.includes('BACS'))req = req + 'B'
        if (amount < 0){
          req = req+'C';
          amount *= -1;
        }
        logs.push(tranformSummaryLogRec({dat, who, walkId, memId, req, amount, note}, members, accs[acc]));
      });
    });
    logit('getAccountLogsByDateAndType ', logs);
    return logs.sort(logCmp);
  }
);

const tranformSummaryLogRec = (logObj, members, acc)=>{
  // logit('logObj pre ', logObj)
  let venue = logObj.walkId ? (_walkData[logObj.walkId] ? _walkData[logObj.walkId].venue : logObj.walkId) : '';
  // if (!logObj.amount) logObj.amount = _walkData[logObj.walkId].fee * request.chargeFactor(logObj.req);
  // if (logObj.amount && logObj.req[0]==='P') logObj.amount = -1 * logObj.amount;
  if (!logObj.memId || logObj.req[0] === 'P') {logObj.name = getAccountName(acc, members);}
  else {logObj.name = members[logObj.memId].firstName+' '+members[logObj.memId].lastName}
  logObj.dispDate = new XDate(logObj.dat).toString('dd MMM HH:mm');
  let text = logObj.text && logObj.text.length > 0 ? `(${logObj.text})` : ''
  logObj.text = (logObj.req[0]==='P' ? logObj.note || '' : ` ${venue} ${text}`);
  // logObj.text = request.names[logObj.req] + (logObj.req==='P' ? '' : ` ${name} ${venue}`);
  // logit('logObj post', logObj)
  return logObj;
};

var _getWalkLogs = [];
var _acc = {};
var _walkData = {};

const tranformLogRec = (logObj, memNames)=>{
  let venue = logObj.walkId ? (_walkData[logObj.walkId] ? _walkData[logObj.walkId].venue : logObj.walkId) : '';
  // if (!logObj.amount) logObj.amount = _walkData[logObj.walkId].fee * request.chargeFactor(logObj.req);
  logObj.amount = (logObj.amount || (_walkData[logObj.walkId] ? _walkData[logObj.walkId].fee || 8 : 8)) * request.chargeFactor(logObj.req);
  // else logObj.amount *= -1;
  let name = logObj.memId ? memNames[logObj.memId] : '';
  logObj.name = name;
  logObj.dispDate = new XDate(logObj.dat).toString('dd MMM HH:mm');
  let text = logObj.text && logObj.text.length > 0 ? `(${logObj.text})` : ''
  logObj.text = (logObj.req==='P' ? logObj.note || '' : ` ${venue} ${text}`);
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
        if (limit && dat >= limit)return;
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
      // logit('getAccountLogs '+accId, {accLog})
      aLogs = aLogs.filter((lg)=>lg[4]!=='P' || (lg[5]!==null && lg[5]!==0))
        .filter((lg)=>!limit || lg[0] < limit)
        .map((log)=>{
          let [dat, who, walkId, memId, req, amount, note] = log;
          return tranformLogRec({dat, who, walkId, memId, req, amount, note}, memNames);
      });
      // logit('getAccountLogs '+accId, aLogs);
      return aLogs;
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
    logs = logs.sort(logCmp).map((log, i)=>{
      // logs = logs.map((log, i)=>{
      balance -= log.amount;
      // logit('log '+accId, {log, balance});
      if (!currentFound && log.req !== 'P' && log.walkId > walkPast)currentFound = true
      if (!currentFound && balance === 0)lastHistory = i;
      if (log.req === 'P' && balance === 0){
        zeroPoints.push(i);
        lastZeroPoint = i;
      }
      if (balance >= 0) lastOK = i;
      return {...log, zeroPoint: balance === 0, balance};
    });
    logs = logs.map((log, i)=>({...log, historic: (i <= lastHistory) }));
    let debt = [];
    if (balance < 0){
      let due = balance;
      // logit('getdebt', balance, logs)
      debt = logs
        .slice(lastOK+1)
        .reverse()
        .map((log, i, arr)=>{
          if (due < 0 && request.billable(log.req)){
            // log.outstanding = true;
            let cancelled = arr.slice(0,i).filter((l)=>{
              const cancelled = l.req.length>1 && l.req[1]==='X' && l.memId === log.memId && l.walkId===log.walkId
              logit('cancelled', {log, l, cancelled})
              return l.req.length>1 && l.req[1]==='X' && l.memId === log.memId && l.walkId===log.walkId
            }).length > 0
            // log.outstanding = log.outstanding && !cancelled
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
  logit('debts', debts);
  return {debts, credits};
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
