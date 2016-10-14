import * as i from 'icepick';
import { createStore, applyMiddleware, compose } from 'redux'
import { assignAll } from 'redux-act';
import createSagaMiddleware from 'redux-saga'
// import reducers from './reducers';
import reducers from './reducers/index.js';
import rootSaga from './sagas/rootSaga'
import initialSaga from './sagas/initialSaga.js';
import createLogger from 'redux-logger';
import sagaMonitor from './sagas/sagaMonitor.js';
import {monitorReplications} from './ducks/replication-duck'
import {default as routerDefault} from './ducks/router-duck'
import {remoteCouch} from './services/remoteCouch'
// import * as ml_actions from './actions/membersList-actions.js';
import * as ct_actions from './actions/controller-actions.js';
import * as ac_actions from './actions/accounts-actions.js';

const logger = createLogger();
export var store ={};
export const sagaMiddleware = createSagaMiddleware({sagaMonitor});
// const sagaMiddleware = createSagaMiddleware();
const defaultState = i.freeze({
  membersList: {list: [], currentPage: 1, dispStart: 0, dispLength: 20, displayMember: null, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false},
  signin: {name: null, roles: [], memberId: ''},
  walks: {list: {}},
  accounts: {list: {}},
  controller: {addToWaitList: false},
  router: routerDefault,
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

  sagaMiddleware.run(initialSaga);

  assignAll(ct_actions, store);
  // assignAll(ml_actions, store);
  assignAll(ac_actions, store);

  sagaMiddleware.run(rootSaga);
  // var remoteCouch = 'http://aidan:admin@localhost:5984/bookings';
  // var remoteCouch = 'http://localhost:3000/db/bookings';

  sagaMiddleware.run(monitorReplications, remoteCouch);
  return store;

};
