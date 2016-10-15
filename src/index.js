// import './abel-polyfill.js';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
console.log('pre store')
import {configureStore} from './store.js';
import MainLayout from './components/layouts/MainLayout.js';
import {template} from './menu/menu.js'
import {remote} from 'electron';
const Menu = remote.Menu;

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const store = configureStore();
console.log('store', store);
render(
        <Provider store={store}>
          <MainLayout />
        </Provider>
        , document.getElementById('root')
);
