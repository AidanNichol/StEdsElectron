// import React from 'react';
import {DS} from 'StEdsStore';
import { observable } from 'mobx';
import { inject } from 'mobx-react';
import { setRouterPage } from '../../ducks/router-mobx.js';

import BusLists from '../views/BusListsM';
import Logit from 'logit';
var logit = Logit(__filename);

// var datColl = new Intl.Collator();
// var datCmp = (a, b) => datColl.compare(a.dat, b.dat);
const uiState = observable({ full: true });
uiState.full = DS.dayNo < 4;
const mapStoreToProps = function(store) {
  const id = store.WS.activeWalk;
  let walkId =
    id && store.WS.bookableWalksId.includes(id) ? id : store.WS.bookableWalksId[0];
  const walk = store.WS.walks.get(walkId);
  if (!walk) walkId = undefined;
  let bookings = (walk && walk.busBookings) || [];
  let cars = (walk && walk.carBookings) || [];
  let waitingList = (walk && walk.waitingList) || [];
  logit('prps', id, walkId, walk, bookings, cars, waitingList);
  // get the data for all the current walks
  let walks = store.WS.bookableWalksId.map(walkId => {
    let { dispDate, venue } = store.WS.walks.get(walkId);
    return { walkId, dispDate, venue };
  });

  var props = {
    walk,
    walkId,
    walks,
    // options,
    bookings,
    cars,
    waitingList,
    status: (walk && walk.bookingTotals) || {},
    // amount: state.walks.list[walkId].fee,
    bookingsAdmin: store.signin.isBookingsAdmin,
    setCurrentWalk: walkId => setRouterPage({ page: 'buslists', walkId }),
    showMemberBookings: memId =>
      setRouterPage({ page: 'bookings', memberId: memId, accountId: null }),
    togglePrint: () => (uiState.full = !uiState.full),
    printFull: uiState.full,
  };
  logit('props', props);
  return props;
};

export default inject(mapStoreToProps)(BusLists);
