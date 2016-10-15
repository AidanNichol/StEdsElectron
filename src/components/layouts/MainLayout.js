// require('less/main.scss');
// <link rel="stylesheet" href="less/mainpage-grid.less" />;
// <link rel="stylesheet" href="less/folder-tabs.less" />;
import React from 'react';
// import { Link } from 'react-router';
import {connect} from 'react-redux';
import classnames from 'classnames';
// import stats from 'main';
// import {Logon} from '../views/logon/Logon.js';
import {Signin} from '../../ducks/signin-duck.js';
import {setPage} from '../../ducks/router-duck.js';
// import {Shortcuts} from '../../views/logon/Logon.js';
import {ReplicationStatus} from '../views/header/ReplicationStatus'
// import store from '../../store';
import {isUserAuthorized} from '../../services/auth.js';
import MembersListContainer from '../containers/members-list-container.js';
import BookingsContainer from '../containers/bookings-container.js';
import BulkAddContainer from '../containers/bulkAdd-container.js';
import BusListsContainer from '../containers/buslists-container.js';
import PaymentsContainer from '../containers/Payments-container.js';

import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'bookings');

// import {Icon} from '../../utility/Icon'
// import DevLinks from '../header/DevLinks.js';
// import DisplayErrors from '../header/DisplayErrors.js';



const loadPage = (curPage, loading)=>{
  if (loading) return (<span>loading ... <img src="../images/gears.svg" /></span>);
  switch(curPage) {
    case 'membersList': return (<MembersListContainer />);
    case 'bookings': return (<BookingsContainer />);
    case 'bulkadd': return (<BulkAddContainer />);
    case 'buslists': return (<BusListsContainer />);
    case 'payments': return (<PaymentsContainer />);
    default: return (<BookingsContainer />);
  }
}

const comp = ({memberAdmin, bookingsAdmin, setPage, loading, curPage})=>{
  const Link = ({page, show, name})=>{
    if (!show) return null;
    var cl = classnames({link: true, selected: curPage === page});
    return (<span onClick={()=>setPage(page)}  className={cl}>{name}</span>)
  }
  logit('currentPage', curPage)
  return (
        <div>
        <div className="mainPage"  style={{paddingLeft:3, paddingTop: 3}}>
        <img className="logo" src={"../images/St.Edwards.col4.png"} width="40px"/>
        <ReplicationStatus className="devlinks"/>
        <Signin />
        {/*<Shortcuts className="shortcuts"/>*/}
        {/*<DisplayErrors />*/}
        <div className="nav">
        <Link page="bookings" name="Bookings" show />
        <Link page="buslists" name="Buslist" show={bookingsAdmin}/>

        <Link page="bulkadd" name="BulkAdd" show={bookingsAdmin}/>
        <Link page="payments" name="Payments" show={bookingsAdmin}/>
        <Link page="membersList" name="Members" show={memberAdmin}/>
        </div>

        <div style={{padding: 5}} className="maincontent">
        {loadPage(curPage, loading)}
        </div>
        </div>

        </div>
      );
}

function mapDispatchToProps(dispatch) {
  return {
    setPage: (page)=>dispatch(setPage({page})),
  }
}

const mapStateToProps = (state) => {

  return {
    bookingsAdmin: isUserAuthorized(['bookings']),
    memberAdmin: isUserAuthorized(['membership', 'bookings']),
    loading: state.controller.loading,
    curPage: state.router.page,
  }
}


export  default connect(
  mapStateToProps,
  mapDispatchToProps
)(comp)
