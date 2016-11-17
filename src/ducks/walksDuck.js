import * as i from 'icepick';
import React from 'react';
import { createSelector } from 'reselect'
// import { createReducer } from 'redux-act';
// import * as actions from '../actions/walks-actions.js';
import { call, take, select, put } from 'redux-saga/effects.js';
import docUpdateSaga from '../sagas/docUpdateSaga.js';
import {pushLog} from '../utilities/docLogging.js';
import Logit from '../factories/logit.js';
import path from 'path'
var logit = Logit('color:white; background:black;', 'Walks:Duck');

import {now, getTodaysDate} from '../utilities/DateUtilities.js';
var _today = getTodaysDate();

export const request = {
  NONE: 'N',
  BOOKED: 'B',
  WAITLIST: 'W',
  CANCELLED: 'X',
  WAITLIST_CANCELLED: 'WX',
  BUS_CANCELLED: 'BX',
  BUS_CANCELLED_LATE: 'BL',
  CAR: 'C',
  CAR_CANCELLED_LATE: 'CL',
  CAR_CANCELLED: 'CX',
  ANNOTATE: 'A',
  LATE: 'L',

  names: {
    N: 'None',
    B: 'Booked',
    W: 'Waitlist',
    X: 'Cancelled',
    WX: 'Cancelled Waitlist',
    BX: 'Cancelled',
    BL: 'Cancelled Late', // no credit
    C: 'Car', // no credit
    CL: 'Car Cancelled Late', // no credit
    CX: 'Car Cancelled',
    A: 'Annotate',
    L: 'LATE',
  },
 no: {
    N: 2,
    B: 0,
    W: 1,
    X: 2,
    WX: 2,
    BX: 2,
    BL: 2, // no credit
    C: 3,
    CL: 2,
    CX: 2,
    A: 2,

  },
  factor: {
    N: 0,
    B: 1,
    W: 0,
    WX: 0,
    WL: 0,
    BX: -1,
    BL: 0, // no credit
    P: -1,
    C: 0.5,
    CX: -0.5,
    CL: 0, // no credit
    A: 0,

  },
  // icons:{
  //   B: (<i className='fa fa-2x fa-bus'></i>),
  //   C: (<i className='fa fa-2x fa-car'></i>),
  //   W: (<i className='fa fa-2x fa-clock-o'></i>),
  // },
  // icon: {
  //     B: 'fa fa-bus ',
  //     W: 'fa fa-clock-o ',
  //     C: 'fa fa-car ',
  // },

  getIcon: (req, extra)=>request.icon[req]+(extra || null) || '',
  getName: (req)=>request.names[req] || '?',
  chargeFactor: (req)=>(request.factor[req]),
  bookable: (value)=>(value !== 'B' && value !== 'W' && value !== 'C'),
  billable: (value)=>(value === 'B' || value === 'BL' || value === 'C' || value === 'CL'),

};

const CHANGE_WALK_DOC = 'change_walk_doc'
const WALK_UPDATE_BOOKING = 'walks/update_booking'
const WALK_ANNOTATE_OPEN_DIALOG = 'walks/annotate_open_dialog'
const WALK_ANNOTATE_CLOSE_DIALOG = 'walks/annotate_close_dialog'
const WALK_ANNOTATE_BOOKING = 'walks/annotate_booking'
const WALK_CLOSE_BOOKINGS = 'walks/close_bookings'
const WALK_UPDATE_BOOKABLE = 'walks/update_bookable'
const DOCS_LOADED = 'walks/docs_loaded'
const WALK_SELECTED = 'walks/selected'

//---------------------------------------------------------------------
//         Icon Component
//---------------------------------------------------------------------
 export function Icon({type, className, ...rest}){
   const loc = path.resolve(__dirname, '../../assets')
   return <img className={(className||'')+' icon'} {...rest} src={`../assets/icon-${type}.svg`} />
 }

//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const updateWalkBookings = (walkId, accId, memId, reqType) => ({type: WALK_UPDATE_BOOKING, walkId, accId, memId, reqType});
export const annotateWalkBookings = (walkId, memId, text) => ({type:WALK_ANNOTATE_BOOKING, walkId, memId, text});
export const annotateOpenDialog = (walkId, memId) => ({type:WALK_ANNOTATE_OPEN_DIALOG, walkId, memId});
export const annotateCloseDialog = () => ({type:WALK_ANNOTATE_CLOSE_DIALOG});
export const closeWalkBookings = (walkId) => ({type:WALK_CLOSE_BOOKINGS, walkId});
export const updateBookableWalks = (walkId) => ({type:WALK_UPDATE_BOOKABLE, walkId});
export const walksDocsLoaded = (docs) => ({type: DOCS_LOADED, docs})
export const walksSelected = (walkId) => ({type: WALK_SELECTED, walkId})
// export const walksUpdateBooking = createAction('WALKS_UPDATE_BOOKING');


var _now = now();
//---------------------------------------------------------------------
//          Reducer
//---------------------------------------------------------------------
logit('loaded', null);
  export default function(state = {list: {}, annotate: {}, current:{}}, action) {
    switch(action.type) {

      case DOCS_LOADED:
        var list = {};
        var bookable = [];
        logit('list', {action, _now, _today});
        action.docs.forEach(doc => {
          if (!doc.walkDate)doc.walkDate=doc._id.substr(1);
          if (doc.firstBooking > _now)return;
          if (!doc.closed){
            bookable.push(doc._id);
            getBookingsSummaryFn[doc._id] = makeGetBookingsSummary(doc._id);
          }
          if (!doc.booked)doc.booked={};
          if (!doc.annotations)doc.annotations={};
          if (!doc.log)doc.log=[];
          list[doc._id] = doc;
        });
        logit('newstate', {list, bookable});
        var current = bookable[0];
        return i.assign(state, {list, bookable, current, annotate: {}});
        // return state.merge({list, bookable, current});
      case CHANGE_WALK_DOC:
        if (state[action.doc._id] && action.doc._rev === state.list[action.doc._id]._rev) return state;
        return i.setIn(state, ['list', action.doc._id], action.doc);
        // return state.setIn(['list', action.doc._id], action.doc);
      case WALK_SELECTED:
        logit('action', action, state.list);
        return i.set(state, 'current', action.walkId);
        // return state.set('current', action.walkId);
      case WALK_ANNOTATE_OPEN_DIALOG:
        return i.set(state, 'annotate', {dialogOpen: true, walkId: action.walkId, memId: action.memId})
      case WALK_ANNOTATE_CLOSE_DIALOG:
        return i.setIn(state, ['annotate', 'dialogOpen'], false)
      case WALK_UPDATE_BOOKABLE:

        return i.set(state, 'bookable', Object.keys(state.list).filter((docId)=>!state.list[docId].closed && state.list[docId].firstBooking <= _now))
      // default:
      //   return state;
    }
    return state;
  }


var doer;

//---------------------------------------------------------------------
//          Utilities
//---------------------------------------------------------------------
const makeGetBookingsSummary = () => createSelector(
    (walk)=>walk,
    (walk)=>{
       let totals = Object.keys(walk.booked||{}).reduce((value, memId)=>{value[request.no[walk.booked[memId]]]++; return value}, [0,0,0,0]);
       let free = walk.capacity - totals[0];
       let display = ''+free + (totals[1] > 0 ? ` (-${totals[1]})` : '');
       return {free, available:free-totals[1], display};
     }
);
var getBookingsSummaryFn = {};
export function getBookingsSummary(walk){
  // logit('getBookingsSummary', walk, getBookingsSummaryFn)
  return getBookingsSummaryFn[walk._id](walk);
}

//---------------------------------------------------------------------
//          Saga
//---------------------------------------------------------------------

export function* walksSaga(args){
  const mapAction = {[WALK_UPDATE_BOOKING]: updateBooking, [WALK_ANNOTATE_BOOKING]: annotateBooking, [WALK_CLOSE_BOOKINGS]: closeWalk}
  logit('loaded', {args, mapAction});
  // try{
    while(true){ // eslint-disable-line no-constant-condition
      logit('waiting for','WALK_UPDATE_BOOKING' );
      let action = yield take([WALK_UPDATE_BOOKING, WALK_ANNOTATE_BOOKING, WALK_CLOSE_BOOKINGS]);
      logit('took', action)
      doer = yield select((state)=>state.signin.memId || '???');
      let walk = yield select((state, walkId)=>state.walks.list[walkId], action.walkId);
      // let newWalk = yield call(action.type === WALK_UPDATE_BOOKING ? updateBooking : annotateBooking, walk, action);
      let newWalk = yield call(mapAction[action.type], walk, action);
      if (newWalk)yield call(docUpdateSaga, newWalk, action);
      if (action.type === WALK_ANNOTATE_BOOKING)yield put(annotateCloseDialog())
      if (action.type === WALK_CLOSE_BOOKINGS)yield put(updateBookableWalks(action.walkId))
    }


  // } catch(error){
  //   yield put({ type: 'WALKS_SAGA_FAILED', error});
  // }
}

function annotateBooking(walk, changes){
  logit('annotateBooking', walk, changes)
  var annotations = walk.annotations || {};
  var memId = changes.memId;
  if (!memId){
    logit('walksSaga Error ', {memId, changes});
    return;
  }
  var reqAnnotation = changes.text;
  var purge = changes.purge;
  var curAnnotation = annotations[memId] || '';
  if (curAnnotation === reqAnnotation) return false; // no change necessary
  annotations = (reqAnnotation.length === 0 ? i.unset(annotations, memId) : i.set(annotations, memId, reqAnnotation));
  logit('setting', {changes, reqAnnotation, annotations})
  var log = pushLog(walk.log, purge, doer, memId, 'A', reqAnnotation,);
  var newDoc = i.chain(walk).set('annotations', annotations).set('log', log).value();
  logit('newDoc', newDoc)
  return newDoc;
}

function updateBooking(walk, changes){
  logit('updateBooking', walk, changes)
  var booked = walk.booked;
  var memId = changes.memId;
  if (!memId){
    logit('walksSaga Error ', {memId, changes});
    return;
  }
  var reqType = changes.reqType;
  var purge = changes.purge;
  var curType = booked[memId] || request.NONE;
  if (curType === reqType) return false; // no change necessary
  if (reqType === request.CANCELLED && (curType === request.NONE || curType.length > 1)) return false;
  var txt = '';
  if (reqType === request.CANCELLED){
    if (walk.lastCancel < _today && !purge && reqType != request.WAITLIST) reqType = curType+request.LATE;
    else reqType = curType+request.CANCELLED;
  }
  var newLog = pushLog(walk.log, purge, doer, memId, reqType,txt);
  var newDoc = {...walk, booked: {...walk.booked, [memId]: reqType}, log: newLog};
  if (reqType === request.CANCELLED)delete newDoc.booked[memId];
  logit('newDoc', newDoc)
  return newDoc;
}

function closeWalk(walk, action){
  logit('closeWalk', walk, action)
  return {...walk, closed: true};
}
