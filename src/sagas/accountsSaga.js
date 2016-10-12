import * as i from 'icepick';
import { call, put, take, select, fork } from 'redux-saga/effects.js';
import docUpdateSaga from '../sagas/docUpdateSaga.js';
import {request} from '../ducks/walksDuck'
import {pushLog} from '../utilities/docLogging.js';
import Logit from '../factories/logit.js';

var logit = Logit('color:white; background:blue;', 'AccountsSaga');

const getAccount = (state, id)=>{
  if (id[0] === 'A')return state.accounts.list[id];
  var accId = state.members[id].accountId;
  return state.accounts.list[accId];
};
var doer;


function* updatePaymentToAccount(action){
    doer = yield select((state)=>state.signin.memId);
    var acc = yield select(getAccount, action.accId);
      // var funds = (acc.funds || 0) + action.amount;
    var log = pushLog(acc.log, false, doer, action.walkId, action.memId, 'P', action.amount, action.note);
    var newAcc = i.set(acc, 'log', log);
    // var newAcc = acc.set('log', log);
    yield call(docUpdateSaga, newAcc, action);
}

function* addTaggedPayment(action){
  logit('addTaggedPayment', action);
  if (action.reType === request.WAITLIST)return;
  if (action.amount === 0)return;
  yield call(updatePaymentToAccount, action);
}

function* deleteTaggedPayment(action){
  logit('deleteTaggedPayment', action);
    doer = yield select((state)=>state.signin.memId);
    var acc = yield select(getAccount, action.accId);
    var j = acc.log.findIndex((log)=>(log[4]==='P' && log[3]===action.memId && log[2]===action.walkId) );
    if (j === -1)return;
    // var funds = (acc.funds || 0) - acc.log[i].amount;
    var log = [].concat((j > 0 ? acc.log.slice(0, j-1) : []), (j < acc.log.length-1 ?  acc.log.slice(j+1) : []));
    var newAcc = i.set(acc, 'log', log);
    // var newAcc = acc.set('log', log);
    yield call(docUpdateSaga, newAcc, action);
}


export default function* accountsSaga(){
  logit('updatePaymentToAccount', 'loaded');
  // launch the sagas that do the real work
  try{
    while(true){ // eslint-disable-line no-constant-condition
      logit('waiting for ', 'ACCOUNT_UPDATE_PAYMENT');
      var action = yield take(['ACCOUNT_UPDATE_PAYMENT', 'ACCOUNT_ADD_TAGGED_PAYMENT', 'ACCOUNT_DEL_TAGGED_PAYMENT']);
      logit('taken '+action.type, action)
      switch(action.type){
        case 'ACCOUNT_UPDATE_PAYMENT': yield fork(updatePaymentToAccount, action); break;
        case 'ACCOUNT_ADD_TAGGED_PAYMENT': yield fork(addTaggedPayment, action); break;
        case 'ACCOUNT_DEL_TAGGED_PAYMENT': yield fork(deleteTaggedPayment, action); break;
      }
    }
  } catch(error){
    logit('Error', error);
    yield put({ type: 'ACCOUNTS_SAGA_FAILED', error});
  }
}
