// single entry point to start all Sagas at once
import { spawn } from 'redux-saga/effects';

import membersSaga from 'sagas/membersSaga';
import {walksSaga} from 'ducks/walksDuck';
import monitorChanges from 'sagas/dbChangeMonitoring';
import accountsSaga from 'sagas/accountsSaga';
import {signinSaga} from 'ducks/signin-duck';
import * as sgnn from 'ducks/signin-duck';
// import {signinSaga} from 'sagas/signinSaga';
// import * as sgnn from 'sagas/signinSaga';
console.log('signinSaga', signinSaga, sgnn, sgnn.signinSaga) ;
export default function * rootSaga() {
  yield([

    spawn(membersSaga),
    spawn(monitorChanges),
    spawn(walksSaga),
    spawn(signinSaga),
    spawn(accountsSaga),
    // call(initialSaga),
  ]);
}
