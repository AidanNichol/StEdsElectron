import React from 'react'
// import { connect } from 'react-redux';
import {inject, observer} from 'mobx-react'
import {observable, autorun, toJS} from 'mobx'
import PaymentsDue from 'components/views/PaymentsDue2.js';
import PaymentsMade from 'components/views/PaymentsReceived.js';
// import {mapStoreToProps as buildDoc} from 'components/views/PaymentsSummary';
import {setRouterPage} from 'ducks/router-mobx.js';
import XDate from 'xdate';
import {flatten} from 'lodash'
import fs from 'fs';
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:mobx');
var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

const uiState = observable({
  displayingDue: true,
  showPaymentsDue: ()=>{uiState.displayingDue = true},
  showPaymentsMade: ()=>{uiState.displayingDue = false},
})
autorun(()=>logit('Changed Displaying. Now showing:', uiState.displayingDue ? 'PaymentsDue' : 'PaymentsMade'))


const mapStoreToProps = function(store) {

  var debts = store.AS.allDebts.debts;
  logit('debts', debts);
  const accs = store.AS.allAccountsStatus.sort(nameCmp);
  const totalPaymentsMade = accs.reduce((sum, log)=>sum+log.paymentsMade, 0);
  return ({
    accs: accs.filter(acc=>acc.activeThisPeriod || acc.balance < 0),
    totalPaymentsMade,
    startDate: store.AS.periodStartDate,
    showPaymentsDue: uiState.showPaymentsDue,
    showPaymentsMade: uiState.showPaymentsMade,
    debts: accs.filter(acc=>acc.balance < 0),
    bankMoney: store.AS.bankMoney,
    doc: buildDoc(store),
    showMemberBookings: (accId)=>setRouterPage({page: 'bookings', memberId: accId, accountId: accId}),

  });
}
const Frame = observer((props)=>(
  <div style={{width:'100%', height:'100%'}}>
    {uiState.displayingDue ? <PaymentsDue {...props}/> : <PaymentsMade {...props}/>}
  </div>
))
export default inject(mapStoreToProps)(Frame)
// export default connect(()=>({test2:'?'}), mapDispatchToProps)(mobxPayments);

const buildDoc = function({AS, DS}) {
  var openingCredit=AS.openingCredit,
      openingDebt=-AS.openingDebt,
      startDate = AS.lastPaymentsBanked,
      endDate = AS.paymentsLogsLimit || DS.getLogTime();
  logit('range data', {startDate, endDate,openingCredit, openingDebt})
  const accountsStatus = toJS(AS.allAccountsStatus);
  const filterCurrentLogs = (logs)=>logs.filter(({dat})=> dat>startDate && dat < endDate);
  logit('accountsStatus', accountsStatus)
  var cLogs = flatten(accountsStatus.map(acc=>filterCurrentLogs(acc.logs)));
  var payments = accountsStatus.filter(acc=>acc.paymentsMade > 0)
  var tots = cLogs.reduce((tot, lg)=>{
    if (!tot[lg.req])tot[lg.req] = [0, 0];
    tot[lg.req][0]++;
    tot[lg.req][1] += Math.abs(lg.amount);
    return tot;
  }, {});

  var doc ={
    closingCredit: accountsStatus.filter(acc=>acc.balance > 0).reduce((sum, item)=>sum+item.balance, 0),
    closingDebt: accountsStatus.filter(acc=>acc.balance < 0).reduce((sum, item)=>sum+item.balance, 0),
    openingCredit,
    openingDebt,
    endDate, startDate,
    payments,
    // aLogs, bLogs,
    cLogs,
    tots,
    startDispDate: startDate && (new XDate(startDate).toString('dd MMM HH:mm')),
    endDispDate: (new XDate(endDate).toString('dd MMM HH:mm')),
    type: 'paymentSummary',
    _id: 'BP'+endDate.substr(0, 16),
  }
  logit('logs doc', doc, __dirname);
  // fs.writeFileSync(`${__dirname}/../../../tests/paymentsFrom${startDate.substr(0,16).replace(/:/g, '.')}.json`, JSON.stringify(doc))
  // logit('write report');
  // paymentsSummaryReport(doc)
  return  doc;
}
