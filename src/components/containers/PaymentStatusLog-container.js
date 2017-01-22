// import React from 'react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import {changeLog} from '../views/bookings/PaymentStatusLog.js';
import {PaymentsBoxes} from 'components/views/bookings/PaymentsBoxes';
import {resetLateCancellation} from 'ducks/walksDuck'
import {setUiState, getUiState} from 'ducks/uiState-duck'
import {getAccDebt} from './PaymentsFunctions.js';
// import { createSelector } from 'reselect'
// import {request} from '../../sagas/walksSaga.js';
// import XDate from 'xdate';
import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'changlog');


function mapDispatchToProps(dispatch) {
  return {
    accountUpdatePayment: (accId, amount, note='', paymentType, inFull)=>{dispatch({type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount, note, paymentType, inFull});},
    changePaymentType: (value)=>dispatch(setUiState('paymentType', value)),
    setHelp: (help)=>{dispatch(setUiState('help', help))}
  };
}

function mapDispatchToPropsChangeLog(dispatch) {
  return {
    accountDeletePayment: (accId, dat)=>{dispatch({type: 'ACCOUNT_DELETE_PAYMENT', accId, dat});},
    resetLateCancellation: (walkId, memId)=>dispatch( resetLateCancellation(walkId, memId)),
  };
}

const mapStateToProps = function(state, {accId}) {
  // let accountCurrent = accId ? state.accounts.list[accId] : {};

  var {balance, logs} = getAccDebt(accId, state);
  var credit = balance > 0 ? balance : 0;
  var owing = balance < 0 ? -balance : 0;
  logit('mapStateToProps', {logs, accId, credit, owing});

  return {
            // members,
            logs,
            accId, credit, owing,
            helpIsOpen: getUiState(state, 'help'),
            paymentType: getUiState(state, 'paymentType'),
      };

}

const mapStateToPropsChangeLog = function(state, {accId}) {
  var startDate = state.paymentsSummary.lastPaymentsBanked;

  var {logs} = getAccDebt(accId, state);

  return {
    accId,
    className: 'redux',
    logs,
    startDate,
  };

}

export  const Payment = connect(mapStateToProps, mapDispatchToProps)(PaymentsBoxes);


export  const ChangeLog = connect(mapStateToPropsChangeLog, mapDispatchToPropsChangeLog)(changeLog);
