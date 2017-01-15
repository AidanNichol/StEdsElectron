// import React from 'react';
import { inject, observer } from 'mobx-react';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import {changeLog} from '../views/bookings/PaymentStatusLog.js';
import {resetLateCancellation} from 'ducks/walksDuck'
import {getAccDebt} from './PaymentsFunctions.js';
import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'mobx:changlog');


const mapStateToPropsChangeLog = function(store, {accId, ...props}) {
  var startDate = store.AS.lastPaymentsBanked;
  logit('store', {store, accId, props})
  var account = accId && store.AS.accounts.get(accId);
  var logs = (account && account.accountStatus.logs) || [];

  return {
    accId,
    logs,
    className: (props.className||'')+' mobx',
    startDate,
    accountDeletePayment: (accId, dat)=>{account.deletePayment(dat)},
    resetLateCancellation: (walkId, memId)=>{},
    };

}


export  const ChangeLogM = inject(mapStateToPropsChangeLog)(observer(changeLog));
