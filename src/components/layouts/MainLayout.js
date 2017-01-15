// require('less/main.scss');
import React from 'react';
// import { Link } from 'react-router';
import {connect} from 'react-redux';
import classnames from 'classnames';
// import stats from 'main';
// import {Logon} from '../views/logon/Logon.js';
import {Signin} from '../../ducks/signin-duck.js';
import {setPage} from '../../ducks/router-duck.js';
import {actionCreators} from '../../ducks/memberslist-duck';
// import {Shortcuts} from '../../views/logon/Logon.js';
import {ReplicationStatus} from '../views/header/ReplicationStatus'
// import store from '../../store';
import {isUserAuthorized} from '../../services/auth.js';
import MembersListContainer from '../containers/members-list-container.js';
import BookingsContainer from '../containers/bookings-container.js';
import ShowConflicts from '../views/ShowConflicts.js';
import ShowAccountConflicts from '../views/ShowAccountConflicts.js';
import BusListsContainer from '../containers/buslists-container.js';
import PaymentsContainer from '../containers/Payments-container.js';
import PaymentsContainerM from 'components/containers/PaymentsMade-mobx';

var packageJson = require('../../../package.json');

const version = packageJson.version;
import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'MainLayout');
const loadPage = (curPage, loading)=>{
  if (loading) return (<span>loading ... <img src="../assets/gears.svg" /></span>);
  switch(curPage) {
    case 'membersList': return (<MembersListContainer />);
    case 'bookings': return (<BookingsContainer />);
    case 'showconflicts': return (<ShowConflicts />);
    // case 'showaccountconflicts': return (<ShowAccountConflicts />);
    case 'showaccountconflicts': return (<PaymentsContainerM />);
    case 'buslists': return (<BusListsContainer />);
    case 'payments': return (<PaymentsContainer />);
    case 'none': return(<div>Welcome to St.Edwards Booking System - please login.</div>)
    default: return (<BookingsContainer />);
  }
}
var myPages = [];
const comp = ({memberAdmin, bookingsAdmin, setPage, loading, curPage})=>{
  myPages = []
  const Link = ({page, show, name})=>{
    if (!show) return null;
    myPages.push (page);
    var cl = classnames({link: true, selected: curPage === page});
    return (<span onClick={()=>setPage(page)}  className={cl}>{name}</span>)
  }
  logit('currentPage', curPage)
  return (
        <div>
          <div className="mainPage" >
            <img className="logo" src={"../assets/St.Edwards.col4.png"} width="40px"/>
            <ReplicationStatus className="devlinks"/>
            <span className="version">v {version}</span>
            <Signin />
            {/*<Shortcuts className="shortcuts"/>*/}
            {/*<DisplayErrors />*/}
            <div className="nav">
              <Link page="bookings" name="Bookings" show={bookingsAdmin} />
              <Link page="buslists" name="Buslist" show={bookingsAdmin}/>

              <Link page="showconflicts" name="ShowConflicts" show={bookingsAdmin}/>
              <Link page="showaccountconflicts" name="ShowAccountConflicts" show={bookingsAdmin}/>
              <Link page="payments" name="Payments" show={bookingsAdmin}/>
        {/* <Link page="paymentsSummary" name="Payments Summary" show={bookingsAdmin}/> */}
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
  const {membersListSetPage} = actionCreators;
  return {
    setPage: (page)=>{
      dispatch(membersListSetPage({resync: true}));
      dispatch(setPage({page}))
    },
  }
}

const mapStateToProps = (state) => {
  let curPage = myPages.includes(state.router.page) ? state.router.page : myPages[0];
  if (!state.signin.name) curPage = 'none';
  return {
    bookingsAdmin: isUserAuthorized(['bookings']),
    memberAdmin: isUserAuthorized(['membership', 'bookings']),
    loading: state.controller.loading,
    curPage: curPage,
  }
}


export  default connect(
  mapStateToProps,
  mapDispatchToProps
)(comp)
