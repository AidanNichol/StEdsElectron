// import 'babel-polyfill'
// import 'longjohn';
import React from 'react';
import ReactDom from 'react-dom';
import {isUserAuthorized} from './services/auth.js';

// import {loginUser} from '_users'
// loginUser()
import fs from 'fs';
import { Provider } from 'react-redux';
import {store, sagaMiddleware} from './store.js';
import { Router, Route, IndexRoute } from 'react-router'
// import { syncHistoryWithStore } from 'react-router-redux'
import initialSaga from './sagas/initialSaga.js';

import MainLayout from '../layouts/main-layout.js';
const Home = ()=>(<div> ?? </div>)
import MembersListContainer from '../containers/members-list-container.js';
import BookingsContainer from '../containers/bookings-container.js';
import BulkAddContainer from '../containers/bulkAdd-container.js';
import BusListsContainer from '../containers/buslists-container.js';
import PaymentsContainer from '../containers/Payments-container.js';

// Provider is a top-level component that wrapps our entire application, including
// the Router. We pass it a reference to the store so we can use react-redux's
// connect() method for Component Containers.
// const history = syncHistoryWithStore(browserHistory, store)
// const svg = fs.readFileSync('file:///www/sites/StEdsElectron/sprites.svg');
// window.steds_svg = svg;
// console.log('steds_svg', svg)
// var svg2 = require('file:///www/sites/StEdsElectron/sprites.svg')
// console.log('steds_svg2', svg2)
ReactDom.render(
  <Provider store={store}>
   <Router >
     <Route path="/" component={MainLayout} onEnter={()=>{sagaMiddleware.run(initialSaga); }}>
       <IndexRoute component={Home} />

       <Route path="membersList/:id" component={MembersListContainer} />
       <Route path="membersList" component={MembersListContainer} />
       {/* <Route path="bulkadd/:id" component={BulkAddContainer}></Route> */}
       {isUserAuthorized([ 'bookings']) ?
         <Route path="bulkadd" component={BulkAddContainer}>
           <IndexRoute component={BulkAddContainer}/>
           <Route path=":id" component={BulkAddContainer} />
         </Route>
          : null}
       {/* <Route path="bulkadd" component={BulkAddContainer} /> */}
       <Route path="buslists/:id" component={BusListsContainer} />
       <Route path="payments" component={PaymentsContainer} />
       <Route path="bookings/:id"  component={BookingsContainer} />
     </Route>
   </Router>
 </Provider>,
  document.getElementById('root')
);
