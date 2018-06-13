import { inject } from 'mobx-react';
import Bookings from '../views/bookings/BookingsM.js';
import { uiStatus } from 'components/views/bookings/PaymentsBoxes';
import { setRouterUser } from 'ducks/router-mobx';
import Logit from 'logit.js';
var logit = Logit(__filename);

const mapStoreToProps = function(store) {
  // get the data for all the current walks
  let openWalks = store.WS.openWalks;

  logit('store', store);
  return {
    openWalks,
    options: store.MS.selectNamesList,
    todaysDate: store.DS.todaysDate,
    // selectNamesList,
    account: store.AS.activeAccount,
    closeWalkBookings: walkId => store.WS.walks.get(walkId).closeWalk(walkId),
    accountSelected: acc => {
      logit('accountSelected', acc);
      store.MS.setActiveMember(acc.memId);
      store.AS.setActiveAccount(acc.accId);
      setRouterUser(acc.memId, acc.accId);
      uiStatus.resetPaymentType();
    },
  };
};

export default inject(mapStoreToProps)(Bookings);
