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
import { monitorChanges } from './ducks/dbChangeMonitoringMobx';
import { monitorReplications } from './ducks/replication-mobx';
import { db, waitForDB, bypasslocal } from './ducks/bookingsDB';
import { WS, MS, AS, PS, DS, init } from 'StEdsStore';
import { router } from './ducks/router-mobx';
const signin = require('StEdsStore').signinState;
import Logit from 'logit';
import { reLogin } from './ducks/signin-mobx';
var logit = Logit(__filename);
logit('logit:opts', opts);
logit('electron', process.versions.electron);
logit('node', process.versions.node);
logit('chrome', process.versions.chrome);
logit('process', process);

const cntrl = observable({ loading: true });

const monitorLoading = action(async () => {
  await waitForDB('main');
  monitorChanges(db);
  await init(db);
  // await PS.init(db);
  // logit('monitorLoading', 'loaded Summary Doc');
  // await Promise.all([MS.init(db), AS.init(db), WS.init(db)]);
  runInAction(() => {
    logit('monitorLoading', 'loaded');
    cntrl.loading = false;
    if (!bypasslocal) monitorReplications(db);
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
