// require('sass/main.scss');
import 'sass/mainpage-grid.scss';
import 'sass/folder-tabs.scss';
import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
// import stats from 'main';
import {Logon} from 'views/logon/Logon';
// import {Shortcuts} from 'views/logon/Logon';
import {ReplicationStatus} from 'views/header/ReplicationStatus'
import store from 'store';
// import DevLinks from 'header/DevLinks';
// import DisplayErrors from './header/DisplayErrors.js';

// const LinkStyle = {
//   fontWeight: 'bold',
//   color: 'blue',
//   fontSize: 16,
//   cursor: 'pointer'
// };


const comp = React.createClass( {
  // componentDidMount: function() {store.dispatch({type: 'INITIAL_LOAD'})},
  render: function(){
    var state = store.getState();
            // stats.update();
    console.log('mainPage', state);
    return (
      <div className="mainPage" >
      <img src="/images/St.Edwards.col4.png" width="70px"/>
      <ReplicationStatus className="devlinks"/>
      {/*<DevLinks className="devlinks"/>*/}
      <Logon />
      {/*<button key="5" className="sc" onClick={window.$$LogSagas}>SagaLog</button>*/}

      {/*<Shortcuts className="shortcuts"/>*/}
        {/*<DisplayErrors />*/}
        <div className="nav">
          <Link to="/bookings/-" activeClassName="selected">Bookings</Link>
          <Link to="/buslists/-" activeClassName="selected">Buslist</Link>
          <Link to="/bulkadd" activeClassName="selected">BulkAdd</Link>
          <Link to="/payments" activeClassName="selected">Payments</Link>
          <Link to="/membersList/-" activeClassName="selected">Members</Link>
        </div>
        {/*<br/>
        <br/>
        <div>
          <Link style={LinkStyle} to="/">Home</Link>
          -
          <Link style={LinkStyle} to="/messages">Messages</Link>
        </div>*/}
        {/*</header>*/}
        <div style={{padding: 15}} className="maincontent">
          {this.props.loading ? (<span>loading ... <img src="/images/gears.svg" /></span>) : this.props.children}
        </div>
      </div>
    );},

})

const mapStateToProps = (state) => {
  return { loading: state.controller.loading }
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
