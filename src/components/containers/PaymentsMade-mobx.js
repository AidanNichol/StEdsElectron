import { connect } from 'react-redux';
import {inject} from 'mobx-react'
import Payments from '../views/PaymentsMade';
import {setPage} from 'ducks/router-duck.js';


function mapDispatchToProps(dispatch) {
  return {
    showMemberBookings: (accId)=>{dispatch(setPage({page: 'bookings', memberId: accId, accountId: accId}))},
  };
}

const mapStateToProps = (store) => ({logs: store.AS.allDebts.payments});

const mobxPayments = inject(mapStateToProps)(Payments)
export default connect(()=>({test2:'?'}), mapDispatchToProps)(mobxPayments);
