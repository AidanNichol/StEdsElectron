// import './abel-polyfill.js';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
console.log('pre store')
import {configureStore} from './store.js';
import MainLayout from './components/layouts/MainLayout.js';

const store = configureStore();
console.log('store', store);
render(
        <Provider store={store}>
          <MainLayout />
        </Provider>
        , document.getElementById('root')
);
