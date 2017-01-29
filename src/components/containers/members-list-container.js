// import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {observer, inject} from 'mobx-react';
import MembersList from '../views/members/MembersList.js';
// import * as actions from '../../actions/membersList-actions.js';
import {actionCreators} from '../../ducks/memberslist-duck';
import {setPage} from '../../ducks/router-duck.js';
import {isUserAuthorized} from '../../services/auth.js';
import { createSelector } from 'reselect'

import Logit from '../../factories/logit.js';
var logit = Logit('color:white; background:navy;', 'MemberList:Container');


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
    // logit('members', members);
    return Object.keys(members).sort(cmp).map((id)=>members[id]);
  }
)
const membersIndexByName = createSelector(
  getSortedMembersList,
  (members)=>{
    let key = [], index={}, lastKey=""
    members.forEach((mem, i)=>{
      let c = mem.lastName[0];
      if (c !== lastKey){
        lastKey = c;
        key.push([c, c, i]);
        index[c] = 0;
      }
      index[c]++;
    });
    return {key, index};
  }
);

const membersIndexByNumber = createSelector(
  getSortedMembersList,
  (members)=>{
    let key = [], index={};
    let bsize = Math.ceil(members.length/24)
    for (var i = 0; i < members.length; i=i+bsize) {
        let c = members[i].memberId;
        key.push(['○', c, i]);
        index[c] = i;
    }
    return {key, index};
  }
);

const getMemberIndex = (store) => store.membersList.sortProp === 'name' ? membersIndexByName(store) : membersIndexByNumber(store);


const newMember = createSelector(
  getSortedMembersList,
  (members)=>{
    var last = members.reduce((max, mem)=>Math.max(max, parseInt(mem._id.substr(1))), 0);
    console.log('create neMember', last, members);
    var id = 'M' + (last + 1);
    return {...newMemberTemplate, _id: id, memberId: id};
  }
);

function getDispStart(list, memId, state){
  const {dispStart, dispLength, resync} = state.membersList;
  if (!resync) return dispStart;
  let i = list.findIndex((mem)=>mem.memberId === memId);
  logit('resync', {i, dispStart, dispLength, dispLast: dispStart + dispLength-1, resync})
  return i >= dispStart && i <= dispStart+dispLength-1 ? dispStart : Math.max(i - 11, 0)
}

function mapDispatchToProps(dispatch) {
  let actions = bindActionCreators(actionCreators, dispatch);
  let membersListSetDisplayedMember = actionCreators.membersListSetDisplayedMember;
  actions.membersListSetDisplayedMember = (memId, dispStart)=>{

    dispatch(membersListSetDisplayedMember(memId, false));
    dispatch(actionCreators.membersListSetPage({value: dispStart}));
    dispatch(setPage({page: 'membersList', memberId: memId, accountId: null}));
  }

  return actions;
  // return bindActionCreators(actionCreators, dispatch);
}
const mapStoreToProps = function(store) {
  return {memberAdmin: store.signin.isMemberAdmin}
}

const mapStateToProps = function(state) {
  var members = state.members;
  let allList = getSortedMembersList(state);
  var member, id;
  if (state.membersList.displayMember === 'new') member= newMember(state);
  else {
    id = state.membersList.displayMember || (state.router && state.router.memberId)
    || (allList && allList.length > 0 && allList[0].memberId);
    // state.membersList.displayMember = id;
    member = members[id];
  }
  //  if (state.membersList.displayMember) member = members[state.membersList.displayMember];
  // else if (state.router.memberId) member = members[state.router.memberId];
  // else member = state.membersList.displayMember;
// logit('whatt!!', state.router, state.membersList.displayMember, id)
  var props = {
            members: state.members,
            ...state.currentMember,
            ...state.membersList,
            dispStart: getDispStart(allList, id, state),
            // syncPos: getDispStart(allList, id, state),
            newMember: (state.membersList.displayMember === 'new'),
            allList,
            newMemberTemplate,
            memberIndex: getMemberIndex(state),
            report: state.controller,
            member,
            displayMember: id,
            // actions,
            memberAdmin: isUserAuthorized(['membership', 'bookings']),
            // listByName: ['membersList', 'listByName'],
            // membersList: state.membersList,
      };
    // if (allList.length > 0 && !props.displayMember) {
    //   props.displayMember = allList[0].memberId;
    //   props.member=allList[0];
    // }
    // logit('container', state, props);
    return props;

}

export default connect(mapStateToProps, mapDispatchToProps)(inject(mapStoreToProps)(observer(MembersList)));
