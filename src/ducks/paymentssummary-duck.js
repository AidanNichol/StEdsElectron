import * as i from 'icepick';
import db from '../services/bookingsDB.js';
import docUpdateSaga from '../sagas/docUpdateSaga';
import { call, put, take } from 'redux-saga/effects.js';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Pay:summ:Duck');

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

export const setLastPaymentsBanked = (date, openingCredit, openingDebt) =>({type: change_bankSubscription_doc, date, openingCredit, openingDebt});
// export const sendBankPtSubscriptionsBanked = (date) =>({type: change_bankPayment_doc, date});
export const saveSummary = (doc) =>({type: SAVE_SUMMARY, doc});
export const getSummary = (id) =>({type: GET_SUMMARY, id});

//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------
export var summaryPaymentsDefaultState = {lastPaymentsBanked: '2016-10-01T00:00:00', lastSubscriptionBanked: undefined, openingCredit: 0, openingDebt: 0, paymentsLogsLimit: '2016-11-04T23:00:00'};

// export function reducer(state = {page: null, memberId: null, accountId: null}, action) {
export function reducer(state = summaryPaymentsDefaultState, action) {
  const doc = action.doc;
  const endDates = {
    '2016-10-01T00:00:00': '2016-11-04T23:00:00',
    '2016-11-04T23:00:00': '2016-11-06T23:00:00',
    '2016-11-06T23:00:00': '2016-11-18T09:00:00',
    '2016-11-18T09:00:00': '2016-11-21T09:00:00',
    '2016-11-21T09:00:00': '2016-12-01T09:27:24',
    '2016-12-01T09:27:24': '2016-12-05T09:00:00',
  }
  switch(action.type) {
    case change_bankPayment_doc:
      logit('change_bankPayment_doc', doc, endDates)

      return i.merge(state, {lastPaymentsBanked: doc.endDate, openingCredit: doc.closingCredit, openingDebt:doc.closingDebt, paymentsLogsLimit: endDates[doc.endDate]});
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

  while (true) { // eslint-disable-line no-constant-condition
    let res;
    let action = yield take([GET_SUMMARY, SAVE_SUMMARY])
    logit('saga take action', action)
    if (action.type === SAVE_SUMMARY){
      logit('db.put', action.doc)
      res = yield call(docUpdateSaga, action.doc);
      // res = yield call([db, db.put], action.doc);
      yield put({type: change_bankPayment_doc, doc:action.doc});
      logit('res', res)
    }
    if (action.type === GET_SUMMARY){
      res = yield call([db, db.get], action.id);
      logit('res', res)
    }
  }
}
