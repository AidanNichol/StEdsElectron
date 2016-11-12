// import React from 'react';
import * as i from 'icepick';
import { connect } from 'react-redux';
import {setPage} from '../../ducks/router-duck.js';
import {getBookingsSummary} from '../../ducks/walksDuck'
import {dispatchIfUnlocked} from 'ducks/lock-duck.js';

import BusLists from '../views/BusLists.js';
// import {accountSelected} from '../actions/accounts-actions.js';
import {isUserAuthorized} from '../../services/auth.js';
import { createSelector } from 'reselect'
import {updateWalkBookings, request} from '../../ducks/walksDuck'
import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'BusLists Container');

var datColl = new Intl.Collator();
var datCmp = (a, b) => datColl.compare(a.dat, b.dat);

const getSortedMemebersList = createSelector(
  (state)=>state.members,
  (members) => {
    var coll = new Intl.Collator();
    var cmp = (a, b) => coll.compare(members[a].lastName+members[a].firstName, members[b].lastName+members[b].firstName);
    return Object.keys(members).sort(cmp).map((id)=>members[id]);
  }
);

const makeGetBookings = (requestType)=> createSelector(
    (state,id)=>state.walks.list[id],
    (state)=>state.members,
    (walk, members)=>{
      let annotations = walk.annotations || {};
      logit('annotations', annotations)
      var nameColl = new Intl.Collator();
      var nameCmp = (a, b) => nameColl.compare(members[a].lastName+members[a].firstName, members[b].lastName+members[b].firstName);
      let bookings = Object.keys(walk.booked)
           .filter((memId)=>{
             if (!members[memId])console.error('memberId not found', memId, walk)
             return walk.booked[memId] === requestType})
           .sort(nameCmp)
           .map((memId)=>{
             if (!members[memId])console.error('memberId not found')
             let name = members[memId] ? members[memId].firstName+' '+members[memId].lastName : '????? !!!!!!';
            //  let name = members[memId].firstName+' '+members[memId].lastName;
             let annotation = (annotations[memId] ? ` (${annotations[memId]})` : '')
             if (members[memId].memberStatus === 'Guest')annotation += ' *G*';
             return { memId, name, annotation, type: walk.booked[memId], requestType};
           });
      logit('getBookings', bookings);
      return bookings;
    }
);
export const getBusBookings = makeGetBookings(request.BOOKED)
export const getCarBookings = makeGetBookings(request.CAR)

export const getWaitingList = createSelector(
    (state, id)=>state.walks.list[id],
    (state)=>state.members,
    (walk, members)=>{
       let bookings = Object.keys(walk.booked)
           .filter((memId)=>walk.booked[memId] === request.WAITLIST)
           .map((memId)=>{
             if (!members[memId])console.error('memberId not found')
             let name = members[memId] ? members[memId].firstName+' '+members[memId].lastName : '????? !!!!!!';
            //  let name = members[memId].firstName+' '+members[memId].lastName;
             let dat = i.thaw(walk.log).reverse().find((log)=>log[2] === memId)[0];
             return {dat, memId, name, waitlisted: true};
           });

       return bookings.sort(datCmp);
     }
);


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


const mapStateToProps = function(state) {
  // get the data for the select name component
  const id = state.router.walkId;
  let walkId = (id && id[0]) === 'W' ? id : state.walks.bookable[0];
  logit('prps',  id, walkId)
  // let walkId = state.walks.current;
  let members = getSortedMemebersList(state);
  let reqType = state.controller.addToWaitList ? request.WAITLIST : request.BOOKED;
  let options = members.map(member=>({memId: member.memberId, reqType, walkId:walkId, accId: member.accountId, label: `${member.lastName}, ${member.firstName}`}));
  let bookings = getBusBookings(state, walkId);
  let cars = getCarBookings(state, walkId);
  let waitingList = getWaitingList(state, walkId);
  // get the data for all the current walks
  let walks = state.walks.bookable.map((walkId)=>{
    let {walkDate, venue, annotations} = state.walks.list[walkId];
    return {walkId, walkDate, venue, annotations};
  });

  var props = {
            walkId,
            walks,
            options,
            bookings,
            cars,
            waitingList,
            status: getBookingsSummary(state.walks.list[walkId]),
            amount: state.walks.list[walkId].fee,
            bookingsAdmin: isUserAuthorized(['bookings']),
            addToWaitList: state.controller.addToWaitList ? true : false,
      };
      logit('props', props);
    return props;

}

export default connect(mapStateToProps, mapDispatchToProps)(BusLists);
