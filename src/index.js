import 'babel-polyfill'
import React from 'react';
import { render } from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as MobxProvider } from 'mobx-react';
import {configureStore} from './store.js';
import MainLayout from './components/layouts/MainLayout.js';
import {template} from './menu/menu.js'
import {remote} from 'electron';
import {opts} from 'factories/logit.js';
import WS from 'mobx/WalksStore'
import MS from 'mobx/MembersStore'
import AS from 'mobx/AccountsStore'
import {router} from 'ducks/router-mobx'
import {state as signin} from 'ducks/signin-mobx'
console.log('logit:opts', opts)

const Menu = remote.Menu;

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
const isOnline = require('is-online');
if (navigator.onLine) {
     isOnline((err, online) => {
        console.log(`are we on line? online: ${online}, err: ${err}`)// we're online if online is true, offline if false
      });
} else {
    console.log(` we're offline`);
}
const store = configureStore();
console.log('store', store);
render(
        <ReduxProvider store={store}>
          <MobxProvider {...{MS, AS, WS, router, signin}}>
            <MainLayout />
          </MobxProvider>
        </ReduxProvider>
        , document.getElementById('root')
);
