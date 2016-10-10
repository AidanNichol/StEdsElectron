/* global process */
import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import {isUserAuthorized} from '../../services/auth.js';

// import {loginUser} from '_users'
// loginUser()

import {sagaMiddleware} from '../../store';
import { Route, IndexRoute } from 'react-router'
import initialSaga from '../../sagas/initialSaga.js';

import MainLayout from '../layouts/main-layout.js';

const Home = ()=>{
  let nodeV = process.versions.node;
  let chromeV = process.versions.chrome;
  let electronV = process.versions.electron;

  return(<div> We are using node {nodeV},
    Chrome {chromeV},
    and Electron {electronV}. </div>);
}
import MembersListContainer from './members-list-container.js';
import BookingsContainer from './bookings-container.js';
import BulkAddContainer from './bulkAdd-container.js';
import BusListsContainer from './buslists-container.js';
import PaymentsContainer from './Payments-container.js';


export default class Root extends Component {
    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <div>
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
                    <Home/>
                </div>
            </Provider>
        );
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
};
