import { connect } from 'react-redux';
import Payments from '../views/Payments.js';
import {getAllDebts, showStats} from './PaymentsFunctions'
import {dispatchIfUnlocked} from 'ducks/lock-duck.js';
import {setPage} from 'ducks/router-duck.js';
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Container');


function mapDispatchToProps(dispatch) {
  return {
    showMemberBookings: (accId)=>{dispatch(setPage({page: 'bookings', memberId: accId, accountId: accId}))},
    accountUpdatePayment: (accId, amount)=>{dispatchIfUnlocked(dispatch, {type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount});},
  };
}

const mapStateToProps = function(state) {

  var debts = getAllDebts(state).debts;
  showStats();
  logit('debts', debts);
  var props = {
    test: 'anything',
            debts,
      };
    return props;

}
export default connect(mapStateToProps, mapDispatchToProps)(Payments);
