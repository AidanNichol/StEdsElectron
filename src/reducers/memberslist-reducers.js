import * as i from 'icepick';
import { createReducer } from 'redux-act';
import * as actions from '../actions/membersList-actions.js';

export default createReducer({

  [actions.membersListOpened]: (state) => i.assign(state, {list: [], currentPage: 1, dispStart: 0, dispLength: 20, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false}),

  [actions.membersListSetSortBy]: (state, value) => i.assign(state, {sortProp: value, currentPage: 1, displayMember: 0}),
  [actions.membersListSetPage]: (state, action) => i.assign(state, { currentPage: action.page, dispStart: action.value}),
  ['MEMBERS_LIST_SET_DISPLAYED_MEMBER']: (state, action) => i.assign(state, {memberId: action, displayMember: action}),
  // inputToState('memberId', ['displayMember', 'memberId']),
  // setItem(['membersList', 'sMember']),
  // setItem(['membersList', 'displayMember']),
  ['MEMBERLIST_CREATE_NEW_MEMBER']: (state)=>i.assign(state, {displayMember: 'new', showEditMemberModal: true}),
  // ['MEMBERS_EDIT_COMPLETE']: (state, action) => i.assign(state, {showEditMemberModal: false}),
  [actions.setShowEditMemberModal]: (state, action) => i.assign(state, {showEditMemberModal: action}),
  [actions.editSaveChanges]: (state) => i.assign(state, {showModal: !state.showModal}),
  // [action.changeMemberDoc]: (state, action) => i.assign(state, {doc._id: doc})
},
i.freeze({list: [], currentPage: 1, dispStart: 0, dispLength: 20, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false})); // <-- This is the default state
