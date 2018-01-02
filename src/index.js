import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { observable, action, runInAction } from 'mobx';
import { Provider as MobxProvider } from 'mobx-react';
import MainLayout from './components/layouts/MainLayout.js';
import { template } from './menu/menu.js';
import { remote } from 'electron';
import { opts } from 'factories/logit.js';
import { monitorChanges } from 'sagas/dbChangeMonitoringMobx';
import { monitorReplications } from 'ducks/replication-mobx';
import WS from 'mobx/WalksStore';
import MS from 'mobx/MembersStore';
import AS from 'mobx/AccountsStore';
import PS from 'mobx/PaymentsSummaryStore';
import DS from 'mobx/DateStore';
import { router } from 'ducks/router-mobx';
import { state as signin } from 'ducks/signin-mobx';
import Logit from 'factories/logit.js';
import { reLogin } from 'ducks/signin-mobx';
var logit = Logit(__filename);
logit('logit:opts', opts);
logit('electron', process.versions.electron);
logit('node', process.versions.node);
logit('chrome', process.versions.chrome);
logit('process', process);

const cntrl = observable({ loading: true });
// logit('mainlayout', membersLoading, accountsLoading, walksLoading);
monitorChanges();
const monitorLoading = action(async () => {
  logit('monitorLoading', 'start');
  // await PS.paymentsSummaryLoading;
  await PS.init();
  logit('monitorLoading', 'loaded Summary Doc');
  await Promise.all([MS.init(), AS.init(), WS.init()]);
  runInAction(() => {
    logit('monitorLoading', 'loaded');
    cntrl.loading = false;
    monitorReplications();
    reLogin();
  });
});
monitorLoading();

const Menu = remote.Menu;
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const isOnline = require('is-online');
if (navigator.onLine) {
  isOnline((err, online) => {
    logit(`are we on line? online: ${online}, err: ${err}`); // we're online if online is true, offline if false
  });
} else {
  logit(` we're offline`);
}

render(
  <MobxProvider
    {...{ MS, AS, WS, DS, PS, router, signin, cntrl, loading: cntrl.loading }}>
    <MainLayout />
  </MobxProvider>,
  document.getElementById('root')
);
