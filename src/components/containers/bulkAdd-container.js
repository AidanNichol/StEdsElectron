// import React from 'react';
import { connect } from 'react-redux';
import BulkAdd from '../views/BulkAdd.js';
import {setPage} from '../../ducks/router-duck.js';
import {isUserAuthorized} from '../../services/auth.js';
import { createSelector } from 'reselect'
import {updateWalkBookings, request} from '../../ducks/walksDuck'
import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'bulkAdd Container');

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

const getBookings = createSelector(
    (state, id)=>state.walks.list[id],
    (state)=>state.members,
    (state)=>state.accounts.list,
    (walk, members, accounts)=>{
       let bookings = Object.keys(walk.booked)
           .filter((memId)=>walk.booked[memId] === request.BOOKED)
           .map((memId)=>{
             if (!members[memId])console.error('memberId not found')
             let name = members[memId] ? members[memId].firstName+' '+members[memId].lastName : '????? !!!!!!';
            //  let name = members[memId].firstName+' '+members[memId].lastName;
             let dat;
             for (let log of walk.log) {
               if (log[2] === memId){
                 dat = log[0];
                 break;
               }
             }

             let accId = members[memId].accountId;
             let accLog = accounts[accId].log || [];
             let amount = walk.fee;
             let paid = accLog.reduce((value, log)=>
               value || (log[4]==='P' && log[3]===memId && log[2]===walk.walkId ),
               false);
             return {dat, memId, accId, name, paid, amount};
           });

       return bookings.sort(datCmp);
     }
);

const getWaitingList = createSelector(
    (state, id)=>state.walks.list[id],
    (state)=>state.members,
    (walk, members)=>{
       let bookings = Object.keys(walk.booked)
           .filter((memId)=>walk.booked[memId] === request.WAITLIST)
           .map((memId)=>{
             if (!members[memId])console.error('memberId not found')
             let name = members[memId] ? members[memId].firstName+' '+members[memId].lastName : '????? !!!!!!';
             let dat;
             for (let log of walk.log) {
               if (log[2] === memId){
                 dat = log[0];
                 break;
               }
             }

             return {dat, memId, name, waitlisted: true};
           });

       return bookings.sort(datCmp);
     }
);

// const getWalkBookingStatus = createSelector(
//     [(state, walkId)=>state[walkId].bookings,
//      (walkId)=>walkId],
//      (bookings)=>{
//        return Object.keys(bookings).reduce((value, memId)=>{value[bookings[memId]]++; return value}, [0,0,0,0]);
//      }
// );
function mapDispatchToProps(dispatch) {
  return {
    setCurrentWalk: (walkId)=>{ dispatch(setPage({page: 'bulkadd', walkId}))},
    // setCurrentWalk: (walkId)=>{dispatch({type: 'WALK_SELECTED', walkId});},
    // walkUpdateBooking: bindActionCreators((walkId, accId, memId, reqType)=>({type: 'WALK_UPDATE_BOOKING', walkId, accId, memId, reqType}), dispatch),
    memSelected: (datum)=>{
      logit('selected datum', datum)
      var {walkId, accId, memId, reqType} = datum;
      dispatch(updateWalkBookings(walkId, accId, memId, reqType));
      if (reqType[0] !== 'W') dispatch({type: 'ACCOUNT_ADD_TAGGED_PAYMENT', ...datum});
    },
    accountAddPayment: (obj)=>{dispatch({type: 'ACCOUNT_ADD_TAGGED_PAYMENT', ...obj});},
    accountDelPayment: (obj)=>{dispatch({type: 'ACCOUNT_DEL_TAGGED_PAYMENT', ...obj});},
    toggleAddToWaitList: ()=>{dispatch({type: 'TOGGLE_ADD_TO_WAITLIST'});},
  }
}


const mapStateToProps = function(state, prps) {
  // get the data for the select name component
  const id = state.router.walkId;
  let currentWalk = (id && id[0]) === 'W' ? id : state.walks.bookable[0];
  logit('prps', prps, id, currentWalk)
  // let currentWalk = state.walks.current;
  let amount = state.walks.list[currentWalk].fee;
  let members = getSortedMemebersList(state);
  let reqType = state.controller.addToWaitList ? request.WAITLIST : request.BOOKED;
  let options = members.map(member=>({memId: member.memberId, reqType, amount, walkId:currentWalk, accId: member.accountId, label: `${member.lastName}, ${member.firstName}`}));
  let bookings = getBookings(state, currentWalk);
  let waitingList = getWaitingList(state, currentWalk);
  // get the data for all the current walks
  let walks = state.walks.bookable.map((walkId)=>{
    let {walkDate, venue} = state.walks.list[walkId];
    return {walkId, walkDate, venue};
  });

  var props = {
            currentWalk,
            walks,
            options,
            bookings,
            waitingList,
            walkId: currentWalk,
            amount: state.walks.list[currentWalk].fee,
            bookingsAdmin: isUserAuthorized(['bookings']),
            addToWaitList: state.controller.addToWaitList ? true : false,
      };
      logit('props', props);
    return props;

}

export default connect(mapStateToProps, mapDispatchToProps)(BulkAdd);
