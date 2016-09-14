// require('sass/main.scss');
import 'sass/mainpage-grid.scss';
import 'sass/folder-tabs.scss';
import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
// import stats from 'main';
// import {Logon} from 'views/logon/Logon';
import {Signin} from 'ducks/signin-duck';
// import {Shortcuts} from 'views/logon/Logon';
import {ReplicationStatus} from 'views/header/ReplicationStatus'
// import store from 'store';
import {isUserAuthorized} from 'services/auth';

// import DevLinks from 'header/DevLinks';
// import DisplayErrors from './header/DisplayErrors.js';

// const LinkStyle = {
//   fontWeight: 'bold',
//   color: 'blue',
//   fontSize: 16,
//   cursor: 'pointer'
// };


const comp = ({memberAdmin, bookingsAdmin, loading, children})=>
     (
      <div className="mainPage" >
      <img src="/images/St.Edwards.col4.png" width="70px"/>
      <ReplicationStatus className="devlinks"/>
      {/*<DevLinks className="devlinks"/>*/}
      <Signin />
      <button key="5" className="sc" onClick={window.$$LogSagas}>SagaLog</button>

      {/*<Shortcuts className="shortcuts"/>*/}
        {/*<DisplayErrors />*/}
        <div className="nav">
          <Link to="/bookings/-" activeClassName="selected">Bookings</Link>
          {bookingsAdmin ? <Link to="/buslists/-" activeClassName="selected">Buslist</Link> : null}

          {bookingsAdmin ? <Link to="/bulkadd" activeClassName="selected">BulkAdd</Link> : null}
          {memberAdmin ? <Link to="/payments" activeClassName="selected">Payments</Link> : null}
          <Link to="/membersList/-" activeClassName="selected">Members</Link>
        </div>

        <div style={{padding: 15}} className="maincontent">
          {loading ? (<span>loading ... <img src="/images/gears.svg" /></span>) : children}
        </div>
      </div>
    );



const mapStateToProps = (state) => {
  return {
    bookingsAdmin: isUserAuthorized(['bookings']),
    memberAdmin: isUserAuthorized(['membership', 'bookings']),
    loading: state.controller.loading,
  }
}
{/*<img src="/images/gears.svg" />
<img src="/images/infinity.gif" />
<img src="/images/dashinfinity.gif" />
<img src="/images/reload.svg" />
<img src="/images/spin.svg" />*/}

export  default connect(
  mapStateToProps,
  // mapDispatchToProps
)(comp)
