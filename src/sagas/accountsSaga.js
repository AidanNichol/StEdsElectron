import * as i from 'icepick';
import { call, put, take, select, fork } from 'redux-saga/effects.js';
import docUpdateSaga from '../sagas/docUpdateSaga.js';
// import {request} from '../ducks/walksDuck'
import {pushAccLog} from '../utilities/docWalkLogging.js';
import Logit from '../factories/logit.js';

var logit = Logit('color:white; background:blue;', 'Accounts:Saga');

const getAccount = (state, id)=>{
  if (id[0] === 'A')return state.accounts.list[id];
  var accId = state.members[id].accountId;
  return state.accounts.list[accId];
};
var doer;


function* updatePaymentToAccount(action){
    doer = yield select((state)=>state.signin.memberId);
    var acc = yield select(getAccount, action.accId);
    var log = pushAccLog(acc.logs, doer, action);
    var newAcc = i.set(acc, 'logs', log);
    // var newAcc = acc.set('log', log);
    yield call(docUpdateSaga, newAcc, action);
}

function* deletePaymentToAccount(action){
    doer = yield select((state)=>state.signin.memberId);
    var acc = yield select(getAccount, action.accId);
    logit('deletePaymentToAccount', action.accId, acc)
    var dat = action.dat
    var logs = acc.logs.filter(log=>log.dat!=dat);
    var newAcc = i.set(acc, 'logs', logs);
    // var newAcc = acc.set('log', log);
    yield call(docUpdateSaga, newAcc, action);
}

function* copyCloneableToAccount(action, type){
    doer = yield select((state)=>state.signin.memberId);
    var acc = yield select(getAccount, action.accId);
    var log = pushAccLog(acc.logs, doer, action);
    var newAcc = i.set(acc, 'logs', log);
    // var newAcc = acc.set('log', log);
    yield call(docUpdateSaga, newAcc, action);
}

export default function* accountsSaga(){
  logit('updatePaymentToAccount', 'loaded');
  // launch the sagas that do the real work
  try{
    while(true){ // eslint-disable-line no-constant-condition
      logit('waiting for ', 'ACCOUNT_UPDATE_PAYMENT');
      var action = yield take(['ACCOUNT_UPDATE_PAYMENT', 'ACCOUNT_UPDATE_SUBSCRIPTION_PAYMENT', 'ACCOUNT_DELETE_PAYMENT']);
      logit('taken '+action.type, action)
      switch(action.type){
        case 'ACCOUNT_UPDATE_SUBSCRIPTION_PAYMENT': yield fork(updatePaymentToAccount, action); break;
        case 'ACCOUNT_UPDATE_PAYMENT': yield fork(updatePaymentToAccount, action); break;
        case 'ACCOUNT_DELETE_PAYMENT': yield fork(deletePaymentToAccount, action); break;
      }
    }
  } catch(error){
    logit('Error', error);
    yield put({ type: 'ACCOUNTS_SAGA_FAILED', error});
  }
}
