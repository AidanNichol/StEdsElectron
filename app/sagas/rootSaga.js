// single entry point to start all Sagas at once
import { call, spawn } from 'redux-saga/effects';

// // import setTitle from './../factories/setTitle.js';
// // import setPage from './../factories/setPage.js';
// import loadMembersTable from './../-members/actions/loadMembersTable.js';
// import loadWalksTable from './../actions/loadWalksTable.js';
// import setWalks from './../actions/setWalks.js';
// import setMembers from './../actions/setMembers.js';
// import setupSyncDB from './../actions/setupSyncDB.js';
// import triggerLoadedRoute from './../actions/common/triggerLoadedRoute.js';
//
// import getSessionData from './../-logon/actions/getSessionData.js';
// import setErrorData from './../actions/common/setErrorData.js';
// import inputToState from 'cerebral-addons/inputToState';

// let newUserAuthenticated = [
// ];
// let authAsVal = (input, state, output)=>{output({profile: {name: 'Val', provider: 'shortcut', email: 'jimandval@jvdavis.plus.com', thumbnail: ''}})}
// export default [
//   [loadWalksTable, {success: [setWalks], error: []},
//    loadMembersTable, {success: [setMembers], error: []}],
//    authAsVal,
//   [getSessionData,
//     {
//       // success: [setSessionData],
//       success: [inputToState('session', ['session'])],
//       error: [setErrorData]
//     }
//   ],
//   setupSyncDB,
//   triggerLoadedRoute,
// ];


import membersSaga from 'sagas/membersSaga';
import {walksSaga} from 'ducks/walksDuck';
import monitorChanges from 'sagas/dbChangeMonitoring';
import accountsSaga from 'sagas/accountsSaga';
// import logonSaga from 'sagas/logonSaga';

export default function * rootSaga() {
  yield([
    //   membersSaga,
    // monitorChanges,
    // walksSaga,
    // accountsSaga,
    // initialSaga,);
    spawn(membersSaga),
    spawn(monitorChanges),
    spawn(walksSaga),
    spawn(accountsSaga),
    // call(initialSaga),
  ]);
}
