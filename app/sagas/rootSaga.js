// single entry point to start all Sagas at once
import { spawn } from 'redux-saga/effects';

import membersSaga from 'sagas/membersSaga';
import {walksSaga} from 'ducks/walksDuck';
import {loginSaga} from 'ducks/login-duck';
import monitorChanges from 'sagas/dbChangeMonitoring';
import accountsSaga from 'sagas/accountsSaga';
// import logonSaga from 'sagas/logonSaga';

export default function * rootSaga() {
  yield([

    spawn(membersSaga),
    spawn(monitorChanges),
    spawn(walksSaga),
    spawn(loginSaga),
    spawn(accountsSaga),
    // call(initialSaga),
  ]);
}
