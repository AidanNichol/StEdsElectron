// import React from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MembersList from '../views/members/MembersList.js';
import * as actions from '../../actions/membersList-actions.js';
import {isUserAuthorized} from '../../services/auth.js';
import { createSelector } from 'reselect'

import Logit from '../../factories/logit.js';
var logit = Logit('color:white; background:navy;', 'MemberList.jsx');


export const newMemberTemplate = {
  // _rev: null,
  _id: 0,
  type: 'member',
  memberId: 0,
  // masterId: '',
  firstName: '',
  lastName: '',
  // name: '',
  address: '',
  phone: '',
  // memNo: '',
  email: '',
  mobile: '',
  joined: '',
  nextOfKin: '',
  medical: '',
  memberStatus: 'Guest',
  suspended: false,
  subscription: '',
};

const getSortedMembersList = createSelector(
  (state)=>state.members,
  (state)=>state.membersList.sortProp,
  (members, sortProp) => {
    var coll = new Intl.Collator();
    var compareNames = (a, b) => coll.compare(members[a].lastName+members[a].firstName, members[b].lastName+members[b].firstName);
    var compareIds = (a, b) => parseInt(a.substr(1))-parseInt(b.substr(1));
    var cmp = (sortProp === 'name' ? compareNames : compareIds);
    console.debug('members', members);
    return Object.keys(members).sort(cmp).map((id)=>members[id]);
  }
)
const newMember = createSelector(
  getSortedMembersList,
  (members)=>{
    var last = members.reduce((max, mem)=>Math.max(max, parseInt(mem._id.substr(1))), 0);
    console.log('create neMember', last, members);
    var id = 'M' + (last + 1);
    return {...newMemberTemplate, _id: id, memberId: id};
  }
);

function mapDispatchToProps(dispatch) {
  return {
    createNewMember: ()=>(dispatch({type: 'MEMBERLIST_CREATE_NEW_MEMBER'})),
  }
}
const mapStateToProps = function(store) {
  var members = store.members;
  // var coll = new Intl.Collator();
  // var compareNames = (a, b) => coll.compare(members[a].lastName+members[a].firstName, members[b].lastName+members[b].firstName);
  // var compareIds = (a, b) => parseInt(a.substr(1))-parseInt(b.substr(1));
  // var cmp = (store.membersList.sortProp === 'name' ? compareNames : compareIds);
  // console.debug('members', members);
  // var allList = Object.keys(members).sort(cmp).map((id)=>members[id]);
  let allList = getSortedMembersList(store);
  var member;
  if (store.membersList.displayMember === 'new') member= newMember(store);
  if (store.membersList.displayMember) member = members[store.membersList.displayMember];
  else member = store.membersList.displayMember;

  var props = {
            members: store.members,
            ...store.currentMember,
            ...store.membersList,
            newMember: (store.membersList.displayMember === 'new'),
            allList,
            newMemberTemplate,
            member,
            actions,
            memberAdmin: isUserAuthorized(['membership', 'bookings']),
            // listByName: ['membersList', 'listByName'],
            // membersList: store.membersList,
      };
    if (allList.length > 0 && !props.displayMember) {
      props.displayMember = allList[0].memberId;
      props.member=allList[0];
    }
    logit('container', store, props);
    return props;

}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);
