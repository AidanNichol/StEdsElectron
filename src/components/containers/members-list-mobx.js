// import React from 'react';
import { observer, inject } from 'mobx-react';
// import { observable, autorun } from 'mobx';
import MembersList from '../views/members/MembersListM.js';
// import * as actions from '../../actions/membersList-actions.js';
import { setRouterPage } from '../../ducks/router-mobx.js';

import Logit from 'logit';
var logit = Logit(__filename);

const mapStoreToProps = function(store) {
  const { MS, AS } = store;
  var editMember = MS.editMember;
  var id;

  var props = {
    dispStart: MS.dispStart,
    dispLength: MS.dispLength,
    sortProp: MS.sortProp,
    editMember: editMember,
    allList: MS.membersSorted,
    memberIndex: MS.membersIndex,
    displayMember: id,
    membersAdmin: store.signin.isMembersAdmin,
    activeMemberId: MS.activeMemberId,
    setActiveMember: memId => {
      logit('setActiveMember', memId);
      setRouterPage({ page: 'membersList', memberId: memId, accountId: null });
    },
    editFunctions: {
      saveEdit: memData => {
        logit('saveEdit', editMember, memData);
        if (editMember.newMember) {
          AS.createNewAccount(memData.accountId, [editMember._id]);
        }
        MS.saveEdit(memData);
      },
      deleteMember: () => {
        const { _id, accountId, fullName } = editMember;
        logit('deleteMember', _id, accountId, fullName);
        const account = AS.accounts.get(accountId);
        if (account) account.deleteMemberFromAccount(editMember._id);
        MS.deleteMember(editMember._id);
      },
    },
    createNewMember: () => {
      MS.createNewMember();
    },
    setDispStart: no => MS.setDispStart(no),
    setSortProp: no => MS.setSortProp(no),
  };
  logit('props', props, MS);
  return props;
};

export default inject(mapStoreToProps)(observer(MembersList));
