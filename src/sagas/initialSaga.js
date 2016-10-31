import db from '../services/bookingsDB.js';
import { call, put } from 'redux-saga/effects.js';
import * as actions from '../actions/controller-actions.js';
import {walksDocsLoaded} from '../ducks/walksDuck'
import {getLastAvailableDate, getTodaysDate} from '../utilities/DateUtilities.js';
import {resignin} from '../ducks/signin-duck'

import Logit from '../factories/logit.js';
var logit = Logit('color:white; background:navy;', 'InitialSaga');


export default function* (){

  const loadMembers = function*(){
    let data = yield call([db, db.allDocs], {include_docs: true, startkey: 'M', endkey: 'M9999999' });
    let docs = data.rows.filter(row => row.doc.type === 'member').map(row => row.doc);
    yield put({ type: 'MEMBER_DOCS_LOAD', docs: docs });
  };
  const loadAccounts = function*(){
    const data = yield call([db, db.allDocs], {include_docs: true, startkey: 'A', endkey: 'A9999999' });
    let docs = data.rows.filter(row => row.doc.type === 'account').map(row => row.doc);
    yield put({ type: 'ACCOUNT_DOCS_LOAD', docs: docs });
  };
  const loadWalks = function*(){
    var _lastAvailableDate = getLastAvailableDate();
    var _today = getTodaysDate();
    // var _getPrevDate = getPrevDate();
    // var _today = XDate.today().toString('yyyy-MM-dd');
    // var _lastAvailableDate = XDate.today().addDays(42).toString('yyyy-MM-dd');
    const filterCurrentWalks = {
      // startkey: "W"+_getPrevDate,
      startkey: "W"+_today,
      endkey: "W"+_lastAvailableDate,
      include_docs: true
    };
    logit('filterCurrentWalks', filterCurrentWalks);
    let data = yield call([db, db.allDocs], filterCurrentWalks);
    let docs = data.rows
                  .filter(row => row.doc.type === 'walk')
                  .map(row => {
                    if (!row.doc.booked)row.doc.booked = {};
                    if (!row.doc.annotations)row.doc.annotations = {};
                    return row.doc});

    const filterPrevWalks = {
      startkey: "W"+docs[0].firstBooking,
      endkey: "W"+_today,
      include_docs: true
    };
    logit('filterPrevWalks', filterPrevWalks);
    data = yield call([db, db.allDocs], filterPrevWalks);
    docs = data.rows.filter(row => row.doc.type === 'walk').map(row => row.doc).concat(docs);

    yield put(walksDocsLoaded(docs));
  };

  // try{
    // yield take('INITIAL_LOAD');
    yield put({type: 'INITIAL_LOAD'});
    yield [
      call(loadMembers),
      call(loadAccounts),
      put({type:'LOAD_WALKS_TABLE'}),
      call(loadWalks),
    ]
    // yield put(setPage({page:'bookings', accountId: 'A992', memberId: 'M992'})); // Mary Johnson
    yield call(actions.initialLoadCompleted);
    yield call(resignin);

  // } catch(error){
  //   yield put({ type: 'INITIAL_SAGA_FAILED', error});
  // }
}
