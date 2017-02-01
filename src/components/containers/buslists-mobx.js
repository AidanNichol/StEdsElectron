// import React from 'react';
import {inject} from 'mobx-react';
import {setRouterPage} from 'ducks/router-mobx.js';

import BusLists from 'components/views/BusListsM';
import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'BusLists:mobx');

// var datColl = new Intl.Collator();
// var datCmp = (a, b) => datColl.compare(a.dat, b.dat);

const mapStoreToProps = function(store) {
  const id = store.WS.activeWalk;
  let walkId = (id && store.WS.bookableWalksId.includes(id) ? id : store.WS.bookableWalksId[0]);
  const walk = store.WS.walks.get(walkId);
  let bookings = walk.busBookings;
  let cars = walk.carBookings;
  let waitingList = walk.waitingList;
  logit('prps',  id, walkId, walk, bookings, cars, waitingList)
  // get the data for all the current walks
  let walks = store.WS.bookableWalksId.map((walkId)=>{
    let {dispDate, venue} = store.WS.walks.get(walkId);
    return {walkId, dispDate, venue};
  });

  var props = {
    walk,
            walkId,
            walks,
            // options,
            bookings,
            cars,
            waitingList,
            status: walk.bookingTotals,
            // amount: state.walks.list[walkId].fee,
            bookingsAdmin: store.signin.isBookingsAdmin,
            setCurrentWalk: (walkId)=>setRouterPage({page: 'buslists', walkId}),
            showMemberBookings: (memId)=>setRouterPage({page: 'bookings', memberId: memId, accountId: null}),
      };
      logit('props', props);
    return props;

}

export default inject(mapStoreToProps)(BusLists);
