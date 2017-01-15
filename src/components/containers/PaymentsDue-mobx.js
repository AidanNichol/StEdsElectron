import { connect } from 'react-redux';
import {inject, observer} from 'mobx-react'
import Payments from '../views/PaymentsDue';
import {getAllDebts, showStats} from './PaymentsFunctions'
import {dispatchIfUnlocked} from 'ducks/lock-duck.js';
import {setPage} from 'ducks/router-duck.js';
import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Mobx');


function mapDispatchToProps(dispatch) {
  return {
    showMemberBookings: (accId)=>{dispatch(setPage({page: 'bookings', memberId: accId, accountId: accId}))},
    accountUpdatePayment: (accId, amount)=>{dispatchIfUnlocked(dispatch, {type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount});},
  };
}

const mapStateToProps = function(store, props) {

  var debts = store.AS.allDebts.debts;
  showStats();
  logit('debts', debts);
  var nprops = {
    test: 'anything',
            debts,
      };
    return nprops;

}
const mobxPayments = inject(mapStateToProps)(observer(Payments))
export default connect(()=>({test2:'?'}), mapDispatchToProps)(mobxPayments);
