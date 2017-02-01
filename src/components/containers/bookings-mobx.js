import {inject} from 'mobx-react';
import Bookings from '../views/bookings/BookingsM.js';
import {callIfUnlocked} from '../../ducks/lock-mobx.js';
import {uiStatus} from 'components/views/bookings/PaymentsBoxes'
import {setRouterUser} from 'ducks/router-mobx';
import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'bookings:Container');

const mapStoreToProps = function(store) {

  // get the data for all the current walks
  let openWalks = store.WS.openWalks;

  logit('store', store)
  return {
    openWalks,
    options: store.MS.selectNamesList,
    // selectNamesList,
    callIfUnlocked,
    account: store.AS.activeAccount,
    closeWalkBookings: (walkId)=>store.WS.walks.get(walkId).closeWalk(walkId),
    accountSelected: (acc)=>{
            logit('accountSelected', acc);
            store.MS.setActiveMember(acc.memId);
            store.AS.setActiveAccount(acc.accId);
            setRouterUser(acc.memId, acc.accId);
            uiStatus.resetPaymentType();
    },
  };
}

export default inject(mapStoreToProps)(Bookings);
