// import React from 'react';
import { inject, observer } from 'mobx-react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import {changeLog} from '../views/bookings/PaymentStatusLog.js';
import {resetLateCancellation} from 'ducks/walksDuck'
import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'mobx:changlog');


function mapDispatchToPropsChangeLog(dispatch) {
  return {
    accountDeletePayment: (accId, dat)=>{dispatch({type: 'ACCOUNT_DELETE_PAYMENT', accId, dat});},
    resetLateCancellation: (walkId, memId)=>dispatch( resetLateCancellation(walkId, memId)),
  };
}
const mapStateToPropsChangeLog = function(store, {accId, ...props}) {
  var startDate = store.AS.lastPaymentsBanked;
  logit('store', {store, accId, props})
  var account = accId && store.AS.accounts.get(accId);
  logit('store 2', account)
  var logs = (account && account.accountStatus.logs) || [];

  return {
    accId,
    logs,
    className: (props.className||'')+' mobx',
    startDate,
    // accountDeletePayment: (accId, dat)=>{account.deletePayment(dat)},
    };

}


const ChangeLogX = inject(mapStateToPropsChangeLog)(observer(changeLog));
export  const ChangeLogM = connect(()=>({}), mapDispatchToPropsChangeLog)(ChangeLogX);
