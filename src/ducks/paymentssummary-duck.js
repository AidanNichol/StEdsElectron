import * as i from 'icepick';
import db from '../services/bookingsDB.js';
import { call, put, take } from 'redux-saga/effects.js';
import {getPrevDate} from '../utilities/DateUtilities.js';
// import { takeLatest } from 'redux-saga';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Lock:Duck');

//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
export const SAVE_SUMMARY = 'SAVE_SUMMARY';
export const GET_SUMMARY = 'GET_SUMMARY';
export const SET_PAYMENTS_LAST_BANKED = 'SET_PAYMENTS_LAST_BANKED';
export const SET_SUBSCRITIONS_LAST_BANKED = 'SET_SUBSCRITIONS_LAST_BANKED';

//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const setPaymentsLastBanked = (date, openingCredit, openingDebt) =>({type: SET_SUBSCRITIONS_LAST_BANKED, date, openingCredit, openingDebt});
export const setSubscriptionsBanked = (date) =>({type: SET_PAYMENTS_LAST_BANKED, date});
export const saveSummary = (doc) =>({type: SAVE_SUMMARY, doc});
export const getSummary = (id) =>({type: GET_SUMMARY, id});

//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------
export var summaryPaymentsDefaultState = {lastPaymentBanked: undefined, lastSubscriptionBanked: undefined, openingCredits: 0, openingDebt: 0};

// export function reducer(state = {page: null, memberId: null, accountId: null}, action) {
export function reducer(state = summaryPaymentsDefaultState, action) {
  switch(action.type) {
    case SET_PAYMENTS_LAST_BANKED:
      return i.set(state, 'lastBanked', action.date);
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
  const data = yield call([db, db.allDocs], {descending: true, limit: 1, include_docs: true, startkey: 'BP9999999', endkey: 'BP00000000' });
  logit('load datasummaries', data)
  const doc = data.rows[0].doc;
  yield put(setPaymentsLastBanked(doc.endDate, doc.closingCredit, doc.openingDebt));

  const data = yield call([db, db.allDocs], {descending: true, limit: 1, include_docs: true, startkey: 'BS9999999', endkey: 'BS00000000' });
  logit('load datasummaries', data)
  const doc = data.rows[0].doc;
  yield put(setSubscriptionsBanked(doc.endDate));

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
