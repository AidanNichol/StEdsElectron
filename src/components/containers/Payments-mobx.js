import React from 'react'
import { connect } from 'react-redux';
import {inject, observer} from 'mobx-react'
import {observable, autorun} from 'mobx'
import PaymentsDue from 'components/views/PaymentsDue2.js';
import PaymentsMade from 'components/views/PaymentsReceived.js';
import {mapStoreToProps as buildDoc} from 'components/views/PaymentsSummary';
import {setPage} from 'ducks/router-duck.js';
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Container');
var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

const uiState = observable({
  displayingDue: true,
  showPaymentsDue: ()=>{uiState.displayingDue = true},
  showPaymentsMade: ()=>{uiState.displayingDue = false},
})
autorun(()=>logit('Changed Displaying. Now showing:', uiState.displayingDue ? 'PaymentsDue' : 'PaymentsMade'))
function mapDispatchToProps(dispatch) {
  return {
    showMemberBookings: (accId)=>{dispatch(setPage({page: 'bookings', memberId: accId, accountId: accId}))},
    // accountUpdatePayment: (accId, amount)=>{dispatchIfUnlocked(dispatch, {type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount});},
  };
}

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
    // showMemberBookings: (accId)=>store.router.setPage({page: 'bookings', memberId: accId, accountId: accId}),

  });
}
const Frame = observer((props)=>(
  <div style={{width:'100%', height:'100%'}}>
    {uiState.displayingDue ? <PaymentsDue {...props}/> : <PaymentsMade {...props}/>}
  </div>
))
const mobxPayments = inject(mapStoreToProps)(Frame)
export default connect(()=>({test2:'?'}), mapDispatchToProps)(mobxPayments);
