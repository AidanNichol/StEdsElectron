// import React from 'react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import PaymentStatusLog from 'views/bookings/PaymentStatusLog';
import {getAccDebt} from 'containers/PaymentsFunctions';
// import { createSelector } from 'reselect'
// import {request} from 'sagas/walksSaga';
// import XDate from 'xdate';
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'changlog');


function mapDispatchToProps(dispatch) {
  return {
    accountUpdatePayment: (accId, amount, note='')=>{dispatch({type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount, note});},
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentStatusLog);
