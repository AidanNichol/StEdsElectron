// single entry point to start all Sagas at once
import { spawn } from 'redux-saga/effects.js';

import membersSaga from '../sagas/membersSaga.js';
import {walksSaga} from '../ducks/walksDuck.js';
import monitorChanges from '../sagas/dbChangeMonitoring.js';
import accountsSaga from '../sagas/accountsSaga.js';
import {signinSaga} from '../ducks/signin-duck.js';
import * as sgnn from '../ducks/signin-duck.js';
// import {signinSaga} from './sagas/signinSaga.js';
// import * as sgnn from './sagas/signinSaga.js';
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
