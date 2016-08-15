// import React from 'react';
import { connect } from 'react-redux';
import Payments from 'views/Payments';
import {getAllDebts, showStats} from 'containers/PaymentsFunctions'
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments-container');


function mapDispatchToProps(dispatch) {
  return {
    accountUpdatePayment: (accId, amount)=>{dispatch({type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount});},
  };
}

const mapStateToProps = function(state) {

  var debts = getAllDebts(state);
  showStats();
  logit('debts', debts);
  var props = {
            debts,
      };
    return props;

}

export default connect(mapStateToProps, mapDispatchToProps)(Payments);
