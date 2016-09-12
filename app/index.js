import 'babel-polyfill'
import 'longjohn';
import React from 'react';
import ReactDom from 'react-dom';

// import {loginUser} from '_users'
// loginUser()

import { Provider } from 'react-redux';
import store, {sagaMiddleware} from './store';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import initialSaga from 'sagas/initialSaga';

import MainLayout from 'layouts/main-layout';

// Pages
import Home from 'home';
// import PageContainer from './components/containers/tab-container';

// import Bookings from './components/bookings';
// import Payments from './components/payments';
// import Buslists from './components/buslists';
// import walks from './components/walks';
// import MemberDetails from './components/memberDetails';
import MembersListContainer from 'containers/members-list-container';
import BookingsContainer from 'containers/bookings-container';
import BulkAddContainer from 'containers/bulkAdd-container';
import BusListsContainer from 'containers/buslists-container';
import PaymentsContainer from 'containers/Payments-container';
// import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/css/bootstrap-theme.css';

// import MemoryStats from 'memory-stats';
//
// export var stats = new MemoryStats();
//
//     stats.domElement.style.position = 'fixed';
//     stats.domElement.style.right        = '0px';
//     stats.domElement.style.bottom       = '0px';
//
//     document.body.appendChild( stats.domElement );
//
//     requestAnimationFrame(function rAFloop(){
//         stats.update();
//         requestAnimationFrame(rAFloop);
//     });

// Provider is a top-level component that wrapps our entire application, including
// the Router. We pass it a reference to the store so we can use react-redux's
// connect() method for Component Containers.
const history = syncHistoryWithStore(browserHistory, store)

// const component = ()=>(
//   <Provider store={store}>
//    <Router history={history}>
//      <Route path="/" component={MainLayout} onEnter={()=>{sagaMiddleware.run(initialSaga);
// }}>
//        <IndexRoute component={Home} />
//        {/*<Route path="bookings" component={Bookings} />
//        <Route path="payments" component={Payments} />
//        <Route path="buslists" component={Buslists} />
//        <Route path="walks" component={walks} />*/}
//        <Route path="membersList/:id" component={MembersListContainer} />
//        <Route path="membersList" component={MembersListContainer} />
//        <Route path="bulkadd/:id" component={BulkAddContainer} />
//        <Route path="bulkadd" component={BulkAddContainer} />
//        <Route path="buslists/:id" component={BusListsContainer} />
//        <Route path="payments" component={PaymentsContainer} />
//        <Route path="bookings/:id"  component={BookingsContainer} />
//      </Route>
//    </Router>
//  </Provider>);
//  document.body.appendChild(component);
ReactDom.render(
  <Provider store={store}>
   <Router history={history}>
     <Route path="/" component={MainLayout} onEnter={()=>{sagaMiddleware.run(initialSaga);
}}>
       <IndexRoute component={Home} />
       {/*<Route path="bookings" component={Bookings} />
       <Route path="payments" component={Payments} />
       <Route path="buslists" component={Buslists} />
       <Route path="walks" component={walks} />*/}
       <Route path="membersList/:id" component={MembersListContainer} />
       <Route path="membersList" component={MembersListContainer} />
       <Route path="bulkadd/:id" component={BulkAddContainer} />
       <Route path="bulkadd" component={BulkAddContainer} />
       <Route path="buslists/:id" component={BusListsContainer} />
       <Route path="payments" component={PaymentsContainer} />
       <Route path="bookings/:id"  component={BookingsContainer} />
     </Route>
   </Router>
 </Provider>,
  document.getElementById('root')
);
