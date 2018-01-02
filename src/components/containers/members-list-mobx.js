// import React from 'react';
import {observer, inject} from 'mobx-react';
import {observable, autorun, toJS} from 'mobx';
import MembersList from '../views/members/MembersListM.js';
// import * as actions from '../../actions/membersList-actions.js';
import {setRouterPage} from '../../ducks/router-mobx.js';


import Logit from '../../factories/logit.js';
var logit = Logit(__filename);

var uiState = observable({editMode: false, dirty:false, deletePending: false, bacs: false})
autorun(()=>{
  if (!uiState.editMode){
    uiState.dirty=false;
    uiState.deletePending = false;
  }
})

// const newMember = createSelector(
//   getSortedMembersList,
//   (members)=>{
//     var last = members.reduce((max, mem)=>Math.max(max, parseInt(mem._id.substr(1))), 0);
//     console.log('create neMember', last, members);
//     var id = 'M' + (last + 1);
//     return {...newMemberTemplate, _id: id, memberId: id};
//   }
// );




const mapStoreToProps = function(store) {
  const {MS, AS} = store;
  var editMember = MS.editMember;
  var id;

  var props = {
    dispStart: MS.dispStart,
    dispLength: MS.dispLength,
    sortProp: MS.sortProp,
    editMember: editMember,
    editMode: uiState.editMode,
    // syncPos: getDispStart(allList, id, state),
    // newMember: (state.membersList.displayMember === 'new'),
    allList: MS.membersSorted,
    memberIndex: MS.membersIndex,
    // report: state.controller,
    displayMember: id,
    memberAdmin: store.signin.isMemberAdmin,
    activeMemberId: MS.activeMemberId,
    setActiveMember: (memId)=>{
      logit('setActiveMember', memId);
      setRouterPage({page: 'membersList', memberId: memId, accountId: null});
    },
    editFunctions: {
      deletePending: uiState.deletePending,
      dirty: uiState.dirty,
      bacs: uiState.bacs,
      resetEdit: ()=>{
        MS.resetEdit();
        uiState.dirty = false;
      },
      saveEdit: ()=>{
        logit('saveEdit', editMember)
        if (editMember.newMember){
          AS.createNewAccount(editMember.accountId, [editMember._id]);
        }
        MS.saveEdit();
        uiState.editMode = false;
      },
      deleteMember: ()=>{
        const {_id, accountId, fullName} = editMember;
        logit('deleteMember', _id, accountId, fullName);
        const account = AS.accounts.get(accountId);
        if (account)account.deleteMemberFromAccount(editMember._id);
        MS.deleteMember(editMember._id);
        uiState.editMode = false;
      },
      cancelEdit: ()=>{
        uiState.editMode = false;
        MS.resetEdit();
      },
      setDeletePending: (bool)=>uiState.deletePending = bool,
      setBacs: (bool)=>uiState.bacs = bool,
      onChangeData: (field, value)=>{
        uiState.dirty = true;
        editMember.updateField(field, value);
      }

    },
    createNewMember: ()=>{
      MS.createNewMember();
      uiState.editMode = true;
    },
    setDispStart: (no)=>MS.setDispStart(no),
    setSortProp: (no)=>MS.setSortProp(no),
    setEditMode: (bool)=>uiState.editMode = bool,
  };
  logit('props', props, MS)
    return props;

}

export default inject(mapStoreToProps)(observer(MembersList));
