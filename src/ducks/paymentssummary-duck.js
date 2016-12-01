import * as i from 'icepick';
import db from '../services/bookingsDB.js';
import { call, put, take } from 'redux-saga/effects.js';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Lock:Duck');

//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
export const SAVE_SUMMARY = 'SAVE_SUMMARY';
export const GET_SUMMARY = 'GET_SUMMARY';
export const change_bankPayment_doc = 'change_bankPayment_doc';
export const change_bankSubscription_doc = 'change_bankSubscription_doc';

//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const setPaymentsLastBanked = (date, openingCredit, openingDebt) =>({type: change_bankSubscription_doc, date, openingCredit, openingDebt});
export const sendBankPtSubscriptionsBanked = (date) =>({type: change_bankPayment_doc, date});
export const saveSummary = (doc) =>({type: SAVE_SUMMARY, doc});
export const getSummary = (id) =>({type: GET_SUMMARY, id});

//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------
export var summaryPaymentsDefaultState = {lastPaymentBanked: undefined, lastSubscriptionBanked: undefined, openingCredits: 0, openingDebt: 0};

// export function reducer(state = {page: null, memberId: null, accountId: null}, action) {
export function reducer(state = summaryPaymentsDefaultState, action) {
  const doc = action.doc;
  switch(action.type) {
    case change_bankPayment_doc:
      return i.merge(state, {lastPaymentBanked: doc.endDate, openingCredit: doc.closingCredit, openingDebt:doc.closingDebt});
    case change_bankSubscription_doc:
      return i.set(state, 'lastSubscriptionBanked', doc.endDate);
    case SAVE_SUMMARY:
      return i.set(state, 'lastBanked', action.doc.endDate);
    // case GET_SUMMARY:
    //   return i.set(state, 'animate', false);
  }
  return state;
}

//---------------------------------------------------------------------
//          Helpers
//---------------------------------------------------------------------



//---------------------------------------------------------------------
//          Saga
//---------------------------------------------------------------------

export function * paymentsummarySaga () {
  let data, doc;
  data = yield call([db, db.allDocs], {descending: true, limit: 1, include_docs: true, startkey: 'BP9999999', endkey: 'BP00000000' });
  logit('load datasummaries', data)
  doc = data.rows[0].doc;
  yield put({type: change_bankPayment_doc, doc});

  data = yield call([db, db.allDocs], {descending: true, limit: 1, include_docs: true, startkey: 'BS9999999', endkey: 'BS00000000' });
  logit('load datasummaries', data)
  doc = data.rows[0].doc;
  yield put({type:change_bankSubscription_doc, doc});

  while (true) { // eslint-disable-line no-constant-condition
    let res;
    let action = yield take([GET_SUMMARY, SAVE_SUMMARY])
    if (action.type === SAVE_SUMMARY){
      res = yield call([db, db.put], action.doc);
      logit('res', res)
    }
    if (action.type === GET_SUMMARY){
      res = yield call([db, db.get], action.id);
      logit('res', res)
    }
  }
}
