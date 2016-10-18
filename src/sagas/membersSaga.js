import Logit from '../factories/logit';
var logit = Logit('color:yellow; background:cyan;', 'members:saga');
import * as i from 'icepick';
import {uniq} from 'ramda';
import { createSelector } from 'reselect'

// import db from '../services/bookingsDB';
import docUpdateSaga from '../sagas/docUpdateSaga';
import {actions, actionCreators} from '../ducks/memberslist-duck';

import { call, put, take, select } from 'redux-saga/effects';

export default function* membersSaga(){


  // try{
    while(true){ // eslint-disable-line no-constant-condition
      // let action = yield take('MEMBER_EDIT_SAVE_CHANGES');
      let action = yield take(actions.SAVE_CHANGES);
      let {doc:{_delete, _deleted, ...doc}, origDoc} = action.payload;
      logit('MEMBER_EDIT_SAVE_CHANGES', {_delete, _deleted, doc, origDoc})
      if (!doc.accountId){ // new member - create account
        doc.accountId = 'A'+doc.memberId.substr(1);
      }
      if (_deleted || _delete)doc._deleted = true;
      doc = i.thaw(doc);
      logit('doc', Object.isExtensible(doc), Object.isSealed(doc), Object.isFrozen(doc))
      // doc = {...doc};
      doc.account = doc.accountId;
      logit('doc', Object.isExtensible(doc), Object.isSealed(doc), Object.isFrozen(doc))
      let accounts = yield select(state=>state.accounts.list);
      if (doc._rev === undefined)doc = i.unset(doc, '_rev');
      if (doc._deleted != true)doc = i.unset(doc, '_deleted');
      // if (doc._delete === true)doc = i.unset(doc, '_deleted');
      logit('doc', doc);
      if (doc._deleted){
        let oldAccount = {...accounts[doc.accountId]};
        logit('delete member account', {doc, accounts, oldAccount});
        oldAccount.members = oldAccount.members.filter(memId=>memId!==doc.memberId);
        if (oldAccount.members.length===0)oldAccount._deleted = true;
        yield call(docUpdateSaga, oldAccount);
      }
      else if (doc.account !== origDoc.account){ // change of account
        logit('account', doc.account);
        let newAccount = i.thaw(accounts[doc.account] || {_id: doc.account, type: 'account', members: []} );
        // if (!newAccount)newAccount = {_id: doc.account, type: 'account', members: []};
        logit('newAccount', Object.isExtensible(newAccount), Object.isSealed(newAccount), Object.isFrozen(newAccount))
        logit('newAccount', Object.isExtensible(newAccount.members), Object.isSealed(newAccount.members), Object.isFrozen(newAccount.members))
        logit('account', newAccount);
        newAccount.members = uniq([...newAccount.members, doc.memberId]);
        logit('account', newAccount);
        // res = yield call([db, db.put], newAccount);
        yield call(docUpdateSaga, newAccount);
        if (accounts[origDoc.account]){
          logit('account', origDoc);
          let oldAccount = {...accounts[origDoc.account]};
          oldAccount.members = oldAccount.members.filter(member=>member!==doc.memberId);
          yield call(docUpdateSaga, oldAccount);
          // res = yield call([db, db.put], oldAccount);
        }

      }
      // res = yield call([db, db.put], doc);
      yield call(docUpdateSaga, doc);
      logit('update', 'done')

      yield put(actionCreators.setShowEditMemberModal(false));
      // yield put({type: actions.SET_EDIT_MODE, payload: false});

      yield put(actionCreators.membersListSetDisplayedMember('M9001', false));
      yield put(actionCreators.membersListSetDisplayedMember(doc._deleted ? undefined : doc.memberId));
      // yield put(actionCreators.membersListSetDisplayedMember(doc._deleted ? undefined : doc.memberId, getDispStart(doc.memberId, state)));
    }


  // } catch(error){
  //   yield put({ type: 'MEMBER_SAGA_FAILED', error});
  // }
}

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

function getDispStart( memId, resync, state){
  let list = getSortedMembersList(state);
  const {dispStart, dispLength, resync: resyncD} = state.membersList;
  if (!resync && !resyncD) return dispStart;
  let i = list.findIndex((mem)=>mem.memberId === memId);
  return i >= dispStart && i <= dispStart+dispLength-1 ? dispStart : Math.max(i - 11, 0)
}
