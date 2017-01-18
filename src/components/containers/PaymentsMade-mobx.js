import { connect } from 'react-redux';
import {inject} from 'mobx-react'
import Payments from '../views/PaymentsMade';
import {setPage} from 'ducks/router-duck.js';


function mapDispatchToProps(dispatch) {
  return {
    showMemberBookings: (accId)=>{dispatch(setPage({page: 'bookings', memberId: accId, accountId: accId}))},
  };
}

const mapStateToProps = (store) => {
  const accs = store.AS.allAccountsStatus.filter(acc=>acc.activeThisPeriod).sort(nameCmp);
  const totalPaymentsMade = accs.reduce((sum, log)=>sum+log.paymentsMade, 0);
  return ({accs, totalPaymentsMade, startDate: store.AS.periodStartDate});
}

const mobxPayments = inject(mapStateToProps)(Payments)
export default connect(()=>({test2:'?'}), mapDispatchToProps)(mobxPayments);

var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);
