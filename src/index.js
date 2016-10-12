// import './abel-polyfill.js';
import React from 'react';
import { render } from 'react-dom';
// import { browserHistory } from 'react-router';
// import { syncHistoryWithStore } from 'react-router-redux';
// import { AppContainer } from 'react-hot-loader';
console.log('pre store')
import {configureStore} from './store.js';
import Root from './components/containers/Root.js';
// import './styles/main.less';

const store = configureStore();
// const history = syncHistoryWithStore(browserHistory, store);
console.log('store', store);
render(
    // <AppContainer>
        <Root store={store} />
    // </AppContainer>
    ,
    document.getElementById('root')
);

// if (module.hot) {
//     module.hot.accept('containers/Root', () => {
//         const NewRoot = require('containers/Root').default;
//         render(
//             <AppContainer>
//                 <NewRoot store={store} history={history} />
//             </AppContainer>,
//             document.getElementById('root')
//         );
//     });
// }