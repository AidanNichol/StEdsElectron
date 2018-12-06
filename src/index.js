// import 'babel-polyfill';
const PouchDB = require('pouchdb-browser');
window.PouchDB = PouchDB;

import React from 'react';
import { render } from 'react-dom';
import { observable, action, runInAction } from 'mobx';
import { Provider as MobxProvider } from 'mobx-react';
import MainLayout from './components/layouts/MainLayout.js';
import { template } from './menu/menu.js';
import { remote } from 'electron';
import { opts } from 'logit';
import { monitorChanges } from 'sagas/dbChangeMonitoringMobx';
import { monitorReplications } from 'ducks/replication-mobx';
import db from 'bookingsDB';
import WS from 'mobx/WalksStore';
import MS from 'mobx/MembersStore';
import AS from 'mobx/AccountsStore';
import PS from 'mobx/PaymentsSummaryStore';
import DS from 'mobx/DateStore';
import { router } from 'ducks/router-mobx';
const signin = require('mobx/signinState');
import Logit from 'logit';
import { reLogin } from 'ducks/signin-mobx';
var logit = Logit(__filename);
logit('logit:opts', opts);
logit('electron', process.versions.electron);
logit('node', process.versions.node);
logit('chrome', process.versions.chrome);
logit('process', process);

const cntrl = observable({ loading: true });
// logit('mainlayout', membersLoading, accountsLoading, walksLoading);
monitorChanges(db);
// .error(error => {
//   logit('monitorChanges failed', error);
// });
const monitorLoading = action(async () => {
  logit('monitorLoading', 'start');
  await PS.init(db);
  logit('monitorLoading', 'loaded Summary Doc');
  await Promise.all([MS.init(db), AS.init(db), WS.init(db)]);
  runInAction(() => {
    logit('monitorLoading', 'loaded');
    cntrl.loading = false;
    monitorReplications(db);
    reLogin();
  });
});
monitorLoading(db);

const Menu = remote.Menu;
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

render(
  <MobxProvider
    {...{ MS, AS, WS, DS, PS, router, signin, cntrl, loading: cntrl.loading }}
  >
    <MainLayout />
  </MobxProvider>,
  document.getElementById('root'),
);
