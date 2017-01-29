import * as i from 'icepick';
import {observable} from 'mobx';
import {merge} from 'lodash';
// import {getSortedMembersList} from '../components/containers/members-list-container'
  const OPENED = 'members/list/opened';
  const SORT_BY = 'members/list/setSortBy';
  const SET_PAGE = 'members/list/setPage';
  const DISPLAYED_MEMBER = 'MEMBERS_LIST_SET_DISPLAYED_MEMBER';
  const SET_EDIT_MODE = 'MEMBERS_EDIT_SETSHOWMODAL';
  const TOGGLE_EDIT_MODE = 'MEMBERS/EDIT/TOGGLESHOWMODAL';
  const SAVE_CHANGES = 'MEMBER_EDIT_SAVE_CHANGES';
  const NEW_MEMBER = 'MEMBER/EDIT/CREATE_NEW';
  const CHANGE_DOC = 'member/change/doc';
  const PRINT_LIST = 'members/list/print';

  export const memberslistState = observable({list: [], dispStart: 0, dispLength: 23, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false, resync: true});
  export const actions ={
    OPENED, SORT_BY, SET_PAGE, DISPLAYED_MEMBER, SET_EDIT_MODE, TOGGLE_EDIT_MODE,
    SAVE_CHANGES, NEW_MEMBER, CHANGE_DOC, PRINT_LIST
  };
  export const actionCreators = {
    membersListOpened: ()=>({type: OPENED}),
    membersListSetSortBy: (payload)=>({type: SORT_BY, payload}),
    membersListSetPage: (payload)=>({type: SET_PAGE, payload}),
    membersListSetDisplayedMember: (memId, resync)=>({type: DISPLAYED_MEMBER, payload:{memId, resync}}),
    setShowEditMemberModal: (payload)=>({type: SET_EDIT_MODE, payload}),
    membersEditSaveChanges: (payload)=>({type: SAVE_CHANGES, payload}),
    changeMemberDoc: (payload)=>({type: CHANGE_DOC, payload}),
    createNewMember: (payload)=>({type: NEW_MEMBER, payload}),
    membersListPrint: (payload)=>({type:PRINT_LIST, payload}),

  }


  export const defaultState = i.freeze({list: [], dispStart: 0, dispLength: 23, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false, resync: true});
  export default function reducer(state = defaultState, action = {}) {
    const {type, payload} = action;
    switch (type) {
      // do reducer stuff
      case OPENED:
        return  i.assign(state, defaultState);
      case SORT_BY:
        merge(memberslistState, {sortProp: payload, resync: true})
        return  i.assign(state, {sortProp: payload, resync: true});
      case SET_PAGE:
        merge(memberslistState, { dispStart: payload.value, resync: payload.resync || false})
        return  i.assign(state, { dispStart: payload.value, resync: payload.resync || false});
      case DISPLAYED_MEMBER:
      merge(memberslistState, {memberId: payload.memId, displayMember: payload.memId, resync: payload.resync})
        return  i.assign(state, {memberId: payload.memId, displayMember: payload.memId, resync: payload.resync});
      case NEW_MEMBER:
        merge(memberslistState, {displayMember: 'new', showEditMemberModal: true, showModal: true})
        return i.assign(state, {displayMember: 'new', showEditMemberModal: true, showModal: true});
      case SET_EDIT_MODE:
        memberslistState.showModal = payload;
        return  i.assign(state, {showEditMemberModal: payload});
      case TOGGLE_EDIT_MODE:
        merge(memberslistState, )
        memberslistState.showEditMemberModal = !memberslistState.showEditMemberModal;
        return  i.assign(state, {showEditMemberModal: !state.showEditMemberModal});
      case SAVE_CHANGES:
        memberslistState.showModal = false;
        return  i.assign(state, {showModal: !state.showModal});
      default: return state;
    }
  }
