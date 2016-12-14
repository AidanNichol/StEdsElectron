import * as i from 'icepick';
import { createStore, applyMiddleware, compose } from 'redux'
// import { assignAll } from 'redux-act';
import createSagaMiddleware from 'redux-saga'
// import reducers from './reducers';
import reducers from './reducers/index.js';
import rootSaga from './sagas/rootSaga'
import initialSaga from './sagas/initialSaga.js';
import createLogger from 'redux-logger';
import sagaMonitor from './sagas/sagaMonitor.js';
import {monitorReplications} from './ducks/replication-duck'
import {routerDefaultState} from './ducks/router-duck'
import {defaultAccountsState} from 'reducers/accounts-reducer'
import {lockDefaultState} from './ducks/lock-duck'
import {summaryPaymentsDefaultState} from 'ducks/paymentssummary-duck'
import {defaultState as memberslistDefault} from './ducks/memberslist-duck'
import {remoteCouch} from './services/remoteCouch'
import {getSettings} from 'ducks/settings-duck'
// import * as ml_actions from './actions/membersList-actions.js';
// import * as ct_actions from './actions/controller-actions.js';
// import * as ac_actions from './actions/accounts-actions.js';

export var store ={};
export const sagaMiddleware = createSagaMiddleware({sagaMonitor});
// const sagaMiddleware = createSagaMiddleware();
const defaultState = i.freeze({
  // membersList: {list: [], currentPage: 1, dispStart: 0, dispLength: 22, displayMember: null, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false},
  membersList: memberslistDefault,
  signin: {name: null, roles: [], memberId: ''},
  walks: {list: {}},
  accounts: defaultAccountsState,
  controller: {addToWaitList: false},
  router: routerDefaultState,
  lock: lockDefaultState,
  paymentsSummary: summaryPaymentsDefaultState,
  uiState: {},
});
export const configureStore = (initalState = defaultState)=>{
  if (!initalState)initalState = defaultState;
  console.log({reducers, sagaMonitor});
  const middlewares = [sagaMiddleware];

  if (getSettings('debug.reduxLogger')) {
    const logger = createLogger({collapsed: true, diff: true});
    middlewares.push(logger);
  }

  store = createStore(
    reducers,
    initalState,
    compose(applyMiddleware(...middlewares),
    // DevTools.instrument(),

    window.devToolsExtension ? window.devToolsExtension() : f => f)
  );
  console.log('store', store.getState());

  sagaMiddleware.run(monitorReplications, remoteCouch);

  sagaMiddleware.run(initialSaga);

  // assignAll(ct_actions, store);
  // assignAll(ml_actions, store);
  // assignAll(ac_actions, store);

  sagaMiddleware.run(rootSaga);
  // var remoteCouch = 'http://aidan:admin@localhost:5984/bookings';
  // var remoteCouch = 'http://localhost:3000/db/bookings';

  return store;

};
