// import React from 'react';
import { connect } from 'react-redux';
import Payments from '../views/Payments.js';
import {getAllDebts, showStats} from './PaymentsFunctions'
import {setPage} from 'ducks/router-duck.js';
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments-container');


function mapDispatchToProps(dispatch) {
  return {
    showMemberBookings: (accId)=>{dispatch(setPage({page: 'bookings', memberId: accId, accountId: accId}))},
    accountUpdatePayment: (accId, amount)=>{dispatch({type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount});},
  };
}

const mapStateToProps = function(state) {

  var debts = getAllDebts(state);
  showStats();
  logit('debts', debts);
  var props = {
    test: 'anything',
            debts,
      };
    return props;

}
export default connect(mapStateToProps, mapDispatchToProps)(Payments);
