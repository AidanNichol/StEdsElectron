// import React from 'react';
import * as i from 'icepick';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Payments from 'views/Payments';
import { createSelector } from 'reselect'
import {request} from 'sagas/walksSaga';
import XDate from 'xdate';
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments-container');

// const getAccountMembers = (state)=>{
//   let accs = state.accounts;
//   return (accs.current ? accs.list[accs.current] : {}).members || [];
// };
const getMemberNames = createSelector(
  (state)=>state.members,
  (state)=>state.accounts.list,
  (members,accounts)=>{
  // let members = getAccountMembers(state);
  return Object.keys(members).reduce((value, memId)=>{
    let accId = members[memId].accountId;
    value[memId] = accounts[accId].members.length > 1 ? members[memId].firstName : '';
    return value;}, {});
});
// const getWalkVenues = (state)=>Object.keys(state.walks.list).reduce((value,walkId)=>{value[walkId] = state.walks.list[walkId].venue.replace(/\(.*\)/, ''); return value;}, {});
var getWalkLogs= [];
var getAccLog = {};
var getAccDebt = {};

const makeGetWalkLogs = (walkId) => createSelector(
    (state)=>state.walks.list[walkId],
    getMemberNames,
    (walk, memNames)=>{
      // logit('in makeGetWalkLogs', {walk, member, memNames, walkId});
      let map = {};
      (walk.log||[]).forEach((log)=>{
        let venue = walk.venue;
        let [dat, who, memId, req] = log;
        let amount = walk.fee * request.chargeFactor(req);
        let name = memNames[memId];
        let reqName = request.names[req];
        let dispDate = new XDate(dat).toString('dd MMM HH:mm');
        let text = `${reqName} ${name} ${venue}`;
        if (!map[memId])map[memId] = [];
        map[memId].push({dat, dispDate, who, memId, req, reqName, amount,  text});
      });
      logit('getWalkLogs '+walk.walkId, map);
      return map;
});

var getCombinedWalkLogs;
const makeGetCombinedWalkLogs = ()=>createSelector(
  ...getWalkLogs,
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
const makeGetAccountLog = (accId)=> createSelector(
    (state)=>state.accounts.list[accId].log || [] ,
    (accLog)=>{
      accLog = i.thaw(accLog);
      // logit('getAccountLogs '+accId, {accLog})
      let aLogs = accLog.filter((lg)=>lg[4]==='P' && lg[5]!==null && lg[5]!==0)
        .map((log)=>{
          let [dat, who, walkId, memId, req, amount] = log;

          return {dat, who, walkId, memId, req, amount};
      });
      logit('getAccountLogs '+accId, aLogs);
      return aLogs;
    });

const makeGetAccountDebt = (accId)=> createSelector(
  getCombinedWalkLogs,
  (state)=>getAccLog[accId](state),
  (state)=>state.accounts.list[accId],
  (state)=>getAccountName(state.accounts.list[accId], state.members),
  (state)=>state.members,
  (wLogs, aLogs, thisAcc, accName, members)=>{
    if (thisAcc.members.length===0 || !members[thisAcc.members[0]])return;
    logit('account '+accId, thisAcc);
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
    logs = logs.sort(logCmp).map((log, i)=>{
    // logs = logs.map((log, i)=>{
      balance += log.amount;
      logit('log '+accId, {log, balance});
      if (balance >= 0) lastOK = i;
      return {...log, balance};
    });
    if (balance < 0){
      let debt = logs
        .slice(lastOK+1)
        .filter((log)=>log.req==='B' || log.req==='L')
        .map((log)=>{
          let owing = Math.min(-log.amount, -balance);
          logit('logs '+accId, {logs, balance, lastOK, owing});
          return {...log, owing};
      });
      logit('logs '+accId, {balance, debt, accName});
      return  {accId, balance, debt, accName, sortname};
    }
}
);

var logColl = new Intl.Collator();
var logCmp = (a, b) => logColl.compare(a.dat, b.dat);

// const reqNames = {B: 'booked', W: 'waitlist', X: 'cancelled', L: 'late cancel', P: 'payment', F: 'freeze'}

function mapDispatchToProps(dispatch) {
  return {
    accountUpdatePayment: bindActionCreators((accId, amount)=>({type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount}), dispatch),
  };
}
const getAccountName = (accountDoc, members)=>{
  let nameMap = accountDoc.members.reduce((value, memId)=>{
    let mem = members[memId] || {firstName: '????', lastName: memId};
    let lName = mem.lastName;
    value[lName] = [...(value[lName] || []), mem.firstName];
    return value;
  }, {});
  return Object.keys(nameMap).map((sName)=> nameMap[sName].join(' & ')+' '+sName).join(' & ');
};

const mapStateToProps = function(store) {
  logit('mapStateToProps', store);
  if (getWalkLogs.length===0){
    store.walks.bookable.forEach((walkId)=>{ getWalkLogs.push(makeGetWalkLogs(walkId));});
    getCombinedWalkLogs = makeGetCombinedWalkLogs();
    logit('create getWalkLogs', getWalkLogs);
  }
  if (Object.keys(getAccLog).length===0 && Object.keys(store.accounts.list).length > 0){
    Object.keys(store.accounts.list).forEach((accId)=>{
      getAccLog[accId] = makeGetAccountLog(accId);
      getAccDebt[accId] = makeGetAccountDebt(accId);
    });
    logit('create getAccLog & getAccDebt', getAccLog, getAccDebt);
  }
  let debts=[];
  Object.keys(store.accounts.list).forEach((accId)=>{
  // ["A1182", "A608"].forEach((accId)=>{
      let debt = getAccDebt[accId](store);
      if (debt) debts.push(debt);
  });

  var nameColl = new Intl.Collator();
  var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

  debts = debts.sort(nameCmp);
  logit('debts', debts);



  // });


  var props = {
            // members,
            debts,
      };
    return props;

}

export default connect(mapStateToProps, mapDispatchToProps)(Payments);
