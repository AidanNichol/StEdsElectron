import { inject } from 'mobx-react';
import Payments from '../views/PaymentsRecieved';
import { setRouterPage } from '../../ducks/router-mobx.js';

const mapStateToProps = store => {
  const accs = store.AS.allAccountsStatus
    .filter(acc => acc.activeThisPeriod)
    .sort(nameCmp);
  const totalPaymentsMade = accs.reduce((sum, log) => sum + log.paymentsMade, 0);
  return {
    accs,
    totalPaymentsMade,
    startDate: store.PS.lastPaymentsBanked,
    showMemberBookings: accId =>
      setRouterPage({ page: 'bookings', memberId: accId, accountId: accId }),
  };
};

export default inject(mapStateToProps)(Payments);

var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);
