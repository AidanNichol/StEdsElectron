// import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router'
import Bookings from 'views/bookings/Bookings';
import * as actions from 'actions/walks-actions';
import {updateWalkBookings, annotateOpenDialog, request} from 'ducks/walksDuck'
// import {accountSelected} from 'actions/accounts-actions';
import {isUserAuthorized} from 'utilities/AJNutility';
import { createSelector } from 'reselect'
import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'bookings');

const getSortedMemebersList = createSelector(
  (state)=>state.members,
  (members) => {
    var coll = new Intl.Collator();
    var cmp = (a, b) => coll.compare(members[a].lastName+members[a].firstName, members[b].lastName+members[b].firstName);
    return Object.keys(members).sort(cmp).map((id)=>members[id]);
  }
);

const makeGetBookingsSummary = () => createSelector(
    (walk)=>walk,
    (walk)=>{
       let totals = Object.keys(walk.booked).reduce((value, memId)=>{value[request.no[walk.booked[memId]]]++; return value}, [0,0,0,0]);
       let available = walk.capacity - totals[0];
       let display = ''+available + (totals[1] > 0 ? ` (-${totals[1]})` : '');
       return {available:available-totals[1], display};
     }
);
var getBookingsSummary = {};

// const getWalkBookingStatus = createSelector(
//     [(state, walkId)=>state[walkId].bookings,
//      (walkId)=>walkId],
//      (bookings)=>{
//        return Object.keys(bookings).reduce((value, memId)=>{value[bookings[memId]]++; return value}, [0,0,0,0]);
//      }
// );
function mapDispatchToProps(dispatch) {
  return {
    walkUpdateBooking: (walkId, accId, memId, reqType)=>dispatch(updateWalkBookings(walkId, accId, memId, reqType)),
    walkCancelBooking: (walkId, accId, memId, reqType)=>dispatch(updateWalkBookings(walkId, accId, memId, reqType+'X')),
    // walkUpdateBooking: bindActionCreators((walkId, accId, memId, reqType)=>({type: 'WALK_UPDATE_BOOKING', walkId, accId, memId, reqType}), dispatch),
    accountSelected: (acc)=>{ logit('accountSelected', acc.value);browserHistory.push('/bookings/'+acc.value)},
    accountUpdatePayment: bindActionCreators((accId, amount)=>({type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount}), dispatch),
    annotateOpenDialog: (...args)=>dispatch(annotateOpenDialog(...args)),
  }
}


const mapStateToProps = function(store, props) {
  // get the data for the select name component
  let members = getSortedMemebersList(store);
  logit('params', props)
  const id = props.params.id;
  let currentAccId = id[0] === 'M' ? store.members[id].accountId : (id[0] === 'A' ? id : undefined);
  // let currentAccId = (id && id[0]) === 'M' ? store.members[id].accountId : id;
  let options = members.map(member=>({value: member.accountId, label: `${member.lastName}, ${member.firstName}`}));
  let accountCurrent = currentAccId ? store.accounts.list[currentAccId] : {};
  let accountMembers = accountCurrent.members ? accountCurrent.members : [];
  // logit('acMem', accountMembers, store.accounts.current);
  // get the names of the members using this account
  let accNames = accountMembers.map((memId)=>{
    return {memId: memId, firstName: store.members[memId].firstName, lastName: store.members[memId].lastName, suspended: store.members[memId].suspended}
  });
  // get the data for all the current walks
  let walks = (store.walks.bookable||[]).map((walkId)=>{
      let walk = store.walks.list[walkId];
      if (!getBookingsSummary[walkId])getBookingsSummary[walkId] = makeGetBookingsSummary(walkId);
      let accBookings = accountMembers.map((memId)=>{
        let annotation = (walk.annotations || {})[memId] || '';
        if (annotation !== '')annotation = `(${annotation})`;
        if (walk.booked[memId]) return {memId, status:walk.booked[memId], annotation};
        else return {memId, status: request.NONE };
    });
    // logit('bookings', accBookings);
    // logit('summary', getBookingsSummary[walkId](walk));
    return {walkId: walkId, walkDate: walkId.substr(1), venue: walk.venue.replace(/\(.*\)/, ''), status: getBookingsSummary[walkId](walk), bookings: accBookings};
  })
  var {_id:accId, credit, owing} = accountCurrent;

  return {
            // members,
            walks,
            account: {accId, credit, owing},
            accNames,
            actions,
            options,
            // accountSelected,
            bookingsAdmin: isUserAuthorized(store.logon.role, ['bookings']),
            annotate: store.walks.annotate,
            // listByName: ['membersList', 'listByName'],
            // membersList: store.membersList,
      };

}

export default connect(mapStateToProps, mapDispatchToProps)(Bookings);
