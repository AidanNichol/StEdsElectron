import { createAction } from 'redux-act';

	export const membersListOpened = createAction('members.list.opened');
	export const membersListSetSortBy = createAction('members.list.setSortBy');
	export const membersListSetPage = createAction('members.list.setPage');
	export const membersListSetDisplayedMember = createAction('MEMBERS_LIST_SET_DISPLAYED_MEMBER');
	export const setShowEditMemberModal = createAction('MEMBERS_EDIT_SETSHOWMODAL');
	export const membersEditSaveChanges = createAction('MEMBER_EDIT_SAVE_CHANGES');
	export const changeMemberDoc = createAction('change_member_doc');

	
