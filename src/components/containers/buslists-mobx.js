// import React from 'react';
import { connect } from 'react-redux';
import {setPage} from '../../ducks/router-duck.js';
import {getBookingsSummary} from '../../ducks/walksDuck'
import {dispatchIfUnlocked} from 'ducks/lock-duck.js';
// import {summaryReport} from 'reports/summaryReport2'

import BusLists from '../views/BusLists.js';
// import {accountSelected} from '../actions/accounts-actions.js';
import {updateWalkBookings, request} from '../../ducks/walksDuck'
import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'BusLists:Container');

// var datColl = new Intl.Collator();
// var datCmp = (a, b) => datColl.compare(a.dat, b.dat);



function mapDispatchToProps(dispatch) {
  return {
    setCurrentWalk: (walkId)=>{ dispatch(setPage({page: 'buslists', walkId}))},
    showMemberBookings: (memId)=>{dispatch(setPage({page: 'bookings', memberId: memId, accountId: null}))},
    // walkUpdateBooking: (walkId, accId, memId, reqType)=>dispatch(updateWalkBookings(walkId, accId, memId, reqType)),
    cancelBooking: (memId, walkId)=>dispatchIfUnlocked(dispatch, updateWalkBookings(walkId, null, memId, request.CANCELLED)),
    convertToBooking: (memId, walkId)=>dispatchIfUnlocked(dispatch, updateWalkBookings(walkId, null, memId, request.booked)),
    printBusList: (walkId)=>dispatch({type: 'buslist/Print', payload:walkId}),
  }
}


const mapStoreToProps = function(store) {
  // summaryReport();
  // get the data for the select name component
  const id = store.WS.activeWalk;
  let walkId = (id && store.walks.bookableWalksId.includes(id) ? id : store.walks.bookableWalksId[0]);
  const walk = store.WS.get(walkId);
  logit('prps',  id, walkId)
  // let walkId = store.walks.current;
  // let reqType = store.controller.addToWaitList ? request.WAITLIST : request.BOOKED;
  // let options = members.map(member=>({memId: member.memberId, reqType, walkId:walkId, accId: member.accountId, label: `${member.lastName}, ${member.firstName}`}));
  let bookings = walk.busBookings;
  let cars = walk.carBookings;
  let waitingList = walk.waitingList;
  // get the data for all the current walks
  let walks = store.walks.bookable.map((walkId)=>{
    let {walkDate, venue, annotations} = store.walks.list[walkId];
    return {walkId, walkDate, venue, annotations};
  });

  var props = {
            walkId,
            walks,
            // options,
            bookings,
            cars,
            waitingList,
            status: bookingTotals(state.walks.list[walkId]),
            // amount: state.walks.list[walkId].fee,
            bookingsAdmin: store.signin.isBookingsAdmin,
      };
      logit('props', props);
    return props;

}

export default connect(mapStateToProps, mapDispatchToProps)(BusLists);
