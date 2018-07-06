import React from 'react';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { SigninForm } from '../../ducks/signin-mobx.js';
import { setRouterPage } from '../../ducks/router-mobx.js';
import { ReplicationStatus } from 'ducks/replication-mobx';
import MembersListContainer from 'components/containers/members-list-mobx.js';
import BookingsContainer from 'components/containers/bookings-mobx.js';
import BusListsContainer from 'components/containers/buslists-mobx.js';
import PaymentsContainerM from 'components/containers/Payments-mobx';

var packageJson = require('../../../package.json');

const version = packageJson.version;
import Logit from 'logit';
var logit = Logit(__filename);

const loadPage = (curPage, cntrl) => {
  if (cntrl.loading)
    return (
      <span>
        loading ... <img src="../assets/gears.svg" />
      </span>
    );
  switch (curPage) {
    case 'membersList':
      return <MembersListContainer />;
    case 'bookings':
      return <BookingsContainer />;
    case 'payments':
      return <PaymentsContainerM />;
    case 'buslists':
      return <BusListsContainer />;
    default:
      return <div>Welcome to St.Edwards Booking System - please login.</div>;
  }
};
var myPages = [];
const comp = observer(({ membersAdmin, bookingsAdmin, setPage, cntrl, router }) => {
  myPages = [];
  const Link = ({ page, show, name }) => {
    if (!show) return null;
    myPages.push(page);
    var cl = classnames({ link: true, selected: router.page === page });
    return (
      <span onClick={() => setPage(page)} className={cl}>
        {name}
      </span>
    );
  };
  logit('currentPage', router.page, cntrl.loading);
  return (
    <div>
      <div className="mainPage">
        <img className="logo" src={'../assets/St.Edwards.col4.png'} width="40px" />
        <ReplicationStatus className="devlinks" />
        <span className="version">v {version}</span>
        <SigninForm />
        <div className="nav">
          <Link page="bookings" name="Bookings" show={bookingsAdmin} />
          <Link page="buslists" name="Buslist" show={bookingsAdmin} />
          <Link page="payments" name="Payments" show={bookingsAdmin} />
          <Link page="membersList" name="Members" show={membersAdmin} />
        </div>

        <div style={{ padding: 5 }} className="maincontent">
          {loadPage(router.page, cntrl)}
        </div>
      </div>
    </div>
  );
});

function mapStoreToProps(store) {
  logit('store', store, myPages);
  // let curPage = myPages.includes(store.router.page) ? store.router.page : myPages[0];
  return {
    bookingsAdmin: store.signin.isBookingsAdmin,
    membersAdmin: store.signin.isMembersAdmin,
    router: store.router,
    curPage: store.router.Page,
    cntrl: store.cntrl,
    setPage: page => {
      setRouterPage({ page });
    },
  };
}

export default inject(mapStoreToProps)(observer(comp));
