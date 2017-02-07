import React from 'react';
import classnames from 'classnames';
import {observer, inject} from 'mobx-react';
import {SigninForm} from '../../ducks/signin-mobx.js';
import {setRouterPage } from '../../ducks/router-mobx.js';
import {ReplicationStatus} from 'ducks/replication-mobx'
import MembersListContainer from 'components/containers/members-list-mobx.js';
import BookingsContainer from 'components/containers/bookings-mobx.js';
import ShowConflicts from 'components/views/ShowConflicts.js';
import BusListsContainer from 'components/containers/buslists-mobx.js';
import PaymentsContainerM from 'components/containers/Payments-mobx';

// import {accountsLoading} from 'mobx/accountsStore';
// import {walksLoading} from 'mobx/walksStore';
// import {membersLoading} from 'mobx/membersStore';

var packageJson = require('../../../package.json');

const version = packageJson.version;
import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'MainLayout');



const loadPage = (curPage, cntrl)=>{
  if (cntrl.loading) return (<span>loading ... <img src="../assets/gears.svg" /></span>);
  switch(curPage) {
    case 'membersList': return (<MembersListContainer />);
    case 'bookings': return (<BookingsContainer />);
    case 'showconflicts': return (<ShowConflicts />);
    // case 'showaccountconflicts': return (<ShowAccountConflicts />);
    case 'payments': return (<PaymentsContainerM />);
    case 'buslists': return (<BusListsContainer />);
    case 'none': return(<div>Welcome to St.Edwards Booking System - please login.</div>)
    default: return (<BookingsContainer />);
  }
}
var myPages = [];
const comp = observer(({memberAdmin, bookingsAdmin, setPage, cntrl, curPage})=>{
  myPages = []
  const Link = ({page, show, name})=>{
    if (!show) return null;
    myPages.push (page);
    var cl = classnames({link: true, selected: curPage === page});
    return (<span onClick={()=>setPage(page)}  className={cl}>{name}</span>)
  }
  logit('currentPage', curPage, cntrl.loading)
  return (
    <div>
      <div className="mainPage" >
        <img className="logo" src={"../assets/St.Edwards.col4.png"} width="40px"/>
        <ReplicationStatus className="devlinks"/>
        <span className="version">v {version}</span>
        <SigninForm />
        <div className="nav">
          <Link page="bookings" name="Bookings" show={bookingsAdmin} />
          <Link page="buslists" name="Buslist" show={bookingsAdmin}/>
          {/* <Link page="showconflicts" name="ShowConflicts" show={bookingsAdmin}/>
          <Link page="showaccountconflicts" name="ShowAccountConflicts" show={bookingsAdmin}/> */}
          <Link page="payments" name="Payments" show={bookingsAdmin}/>
          <Link page="membersList" name="Members" show={memberAdmin}/>
        </div>

        <div style={{padding: 5}} className="maincontent">
          {loadPage(curPage, cntrl)}
        </div>
      </div>
    </div>
  );
});

function mapStoreToProps(store){
  logit('store', store, myPages)
  let curPage = myPages.includes(store.router.page) ? store.router.page : myPages[0];
  if (!store.signin.loggedIn) curPage = 'none';
  return ({
    bookingsAdmin: store.signin.isBookingsAdmin,
    memberAdmin: store.signin.isMemberAdmin,
    curPage: curPage,
    cntrl: store.cntrl,
    setPage: (page)=>{
      setRouterPage({page});
    },
  })

}



export  default inject(mapStoreToProps)(observer(comp));
