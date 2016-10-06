// import Reactotron from 'reactotron'
//
// // connect with defaults
// Reactotron.connect()
//
// // Connect with options
//
// const options = {
//   name: 'React Web', // Display name of the client
//   server: 'localhost', // IP of the server to connect to
//   port: 3334, // Port of the server to connect to (default: 3334)
//   enabled: true // Whether or not Reactotron should be enabled.
// }
//
// Reactotron.connect(options);
// import DevTools from '../containers/DevTools.js';

import * as i from 'icepick';
import { createStore, applyMiddleware, compose } from 'redux'
import { assignAll } from 'redux-act';
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas/rootSaga'
import createLogger from 'redux-logger';
import sagaMonitor from './sagas/sagaMonitor.js';
import {monitorReplications} from './ducks/replication-duck'
import {remoteCouch} from './services/remoteCouch'
import reducers from './reducers/index.js';
import * as ml_actions from './actions/membersList-actions.js';
import * as ct_actions from './actions/controller-actions.js';
import * as ac_actions from './actions/accounts-actions.js';

const logger = createLogger();
export var store ={};
export const sagaMiddleware = createSagaMiddleware({sagaMonitor});
// const sagaMiddleware = createSagaMiddleware();
const defaultState = i.freeze({
  membersList: {list: [], currentPage: 1, dispStart: 0, dispLength: 20, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false},
  signin: {name: null, roles: [], memberId: ''},
  walks: {list: {}},
  accounts: {list: {}},
  controller: {addToWaitList: false},
});
export const configureStore = (initalState = defaultState)=>{
  if (!initalState)initalState = defaultState;
  console.log({reducers, sagaMonitor});
  store = createStore(
    reducers,
    initalState,
    compose(applyMiddleware(sagaMiddleware, logger),
    // DevTools.instrument(),

    window.devToolsExtension ? window.devToolsExtension() : f => f)
  );
  console.log('store', store.getState());

  assignAll(ct_actions, store);
  assignAll(ml_actions, store);
  assignAll(ac_actions, store);

  sagaMiddleware.run(rootSaga);
  // var remoteCouch = 'http://aidan:admin@localhost:5984/bookings';
  // var remoteCouch = 'http://localhost:3000/db/bookings';

  sagaMiddleware.run(monitorReplications, remoteCouch);
  return store;

};
