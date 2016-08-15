import * as i from 'icepick';
import { createReducer } from 'redux-act';
// import { createAction } from 'redux-act';

	const OPENED = 'members/list/opened';
	const SORT_BY = 'members/list/setSortBy';
	const SET_PAGE = 'members/list/setPage';
	const DISPLAYED_MEMBER = 'MEMBERS/LIST/SET_DISPLAYED_MEMBER';
	const SET_EDIT_MODE = 'MEMBERS/EDIT/SETSHOWMODAL';
	const SAVE_CHANGES = 'MEMBER/EDIT/SAVE_CHANGES';
	const NEW_MEMBER = 'MEMBER/EDIT/CREATE_NEW';
	const CHANGE_DOC = 'member/change/doc';

	export const membersListOpened = ()=>{type: OPENED};
	export const membersListSetSortBy = (payload)=>{type: SORT_BY, payload};
	export const membersListSetPage = (payload)=>{type: SET_PAGE, payload};
	export const membersListSetDisplayedMember = (payload)=>{type: DISPLAYED_MEMBER, payload};
	export const setShowEditMemberModal = (payload)=>{type: SET_EDIT_MODE, payload};
	export const membersEditSaveChanges = (payload)=>{type: SAVE_CHANGES, payload};
	export const changeMemberDoc = (payload)=>{type: CHANGE_DOC, payload};
	export const createNewMember = (payload)=>{type: NEW_MEMBER, payload};

  const defaultState = i.freeze({list: [], currentPage: 1, dispStart: 0, dispLength: 20, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false});
  export default function reducer(state = defaultState, action = {}) {
    switch (action.type) {
      // do reducer stuff
      default: return state;
    }
  }
export default createReducer({

  [OPENED]: (state) => i.assign(state, {list: [], currentPage: 1, dispStart: 0, dispLength: 20, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false}),

  [SORT_BY]: (state, value) => i.assign(state, {sortProp: value, currentPage: 1, displayMember: 0}),
  [SET_PAGE]: (state, action) => i.assign(state, { currentPage: action.page, dispStart: action.value}),
  [DISPLAYED_MEMBER]: (state, action) => i.assign(state, {memberId: action, displayMember: action}),
  [NEW_MEMBER]: (state)=>i.assign(state, {displayMember: 'new', showEditMemberModal: true}),
  [SET_EDIT_MODE]: (state, action) => i.assign(state, {showEditMemberModal: action}),
  [SAVE_CHANGES]: (state) => i.assign(state, {showModal: !state.showModal}),
  // [action.changeMemberDoc]: (state, action) => i.assign(state, {doc._id: doc})
},);
