import * as i from 'icepick';
import db from '../services/bookingsDB.js';
import { call, put, take } from 'redux-saga/effects.js';
// import { takeLatest } from 'redux-saga';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Lock:Duck');

logit('settings', lockSettings)
//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
export const SAVE_SUMMARY = 'SAVE_SUMMARY';
export const GET_SUMMARY = 'GET_SUMMARY';

//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const saveSummary = (doc) =>({type: SAVE_SUMMARY, doc});
export const getSummary = (id) =>({type: GET_SUMMARY, id});

//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------
export var lockDefaultState = {locked: true, animate:false};

// export function reducer(state = {page: null, memberId: null, accountId: null}, action) {
export function reducer(state = lockDefaultState, action) {
  switch(action.type) {
    case SAVE_SUMMARY:
      return i.set(state, 'animate', action.animate);
    case GET_SUMMARY:
      return i.set(state, 'animate', false);
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
