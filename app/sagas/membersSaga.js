import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'EditMemberData.js');
import * as i from 'icepick';
import {uniq} from 'ramda';

// import db from 'services/bookingsDB';
import docUpdateSaga from 'sagas/docUpdateSaga';

import { call, put, take, select } from 'redux-saga/effects';

export default function* membersSaga(){


  // try{
    while(true){ // eslint-disable-line no-constant-condition
      let action = yield take('MEMBER_EDIT_SAVE_CHANGES');
      let {doc, origDoc} = action.payload;
      if (!doc.account){ // new member - create account
        doc.account = 'A'+doc.memberId.substr(1);
      }
      doc = i.thaw(doc);
      logit('doc', Object.isExtensible(doc), Object.isSealed(doc), Object.isFrozen(doc))
      doc = {...doc};
      doc.accountId = doc.account;
      logit('doc', Object.isExtensible(doc), Object.isSealed(doc), Object.isFrozen(doc))
      let accounts = yield select(state=>state.accounts.list);
      if (doc._rev === undefined)doc = i.unset(doc, '_rev');
      if (doc._deleted != true)doc = i.unset(doc, '_deleted');
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
      // if (!res.ok) yield put({ type: 'MEMBER_SAGA_FAILED', res});
      // console.log('res', res);
      yield put({type: 'MEMBERS_EDIT_SETSHOWMODAL', payload: false});
      yield put({type: 'MEMBERS_LIST_SET_DISPLAYED_MEMBER', payload: doc._delete ? undefined : doc.memberId});
    }


  // } catch(error){
  //   yield put({ type: 'MEMBER_SAGA_FAILED', error});
  // }
}
