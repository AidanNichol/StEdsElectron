// import React from 'react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import {changeLog, payment} from '../views/bookings/PaymentStatusLog.js';
import {getAccDebt} from './PaymentsFunctions.js';
// import { createSelector } from 'reselect'
// import {request} from '../../sagas/walksSaga.js';
// import XDate from 'xdate';
import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'changlog');


function mapDispatchToProps(dispatch) {
  return {
    accountUpdatePayment: (accId, amount, note='', bacs=false, inFull)=>{dispatch({type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount, note, bacs, inFull});},
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
            accId, credit, owing
      };

}

export  const Payment = connect(mapStateToProps, mapDispatchToProps)(payment);


export  const ChangeLog = connect(mapStateToProps)(changeLog);
