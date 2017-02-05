import { combineReducers } from 'redux';
// import { routerReducer } from 'react-router-redux'
import {reducer as formReducer} from 'redux-form';
// import {properCaseName, properCaseAddress, normalizePhone} from '../components/utility/normalizers.js';

// Reducers
import members from 'reducers/members-reducers';
import walks from 'ducks/walksDuck';
import accounts from 'reducers/accounts-reducer';
// import membersList from 'reducers/memberslist-reducers';
import membersList from 'ducks/memberslist-duck';
import {reducer as signinReducer } from 'ducks/signin-duck';
import controller from 'reducers/controller-reducers';
// import replicator from 'ducks/replication-duck';
import {reducer as router} from 'ducks/router-duck';
// import {reducer as uiState} from 'ducks/uiState-duck';
import {reducer as lockReducer} from 'ducks/lock-duck';
import {reducer as paymentsSummary} from 'ducks/paymentssummary-duck';
console.log('signin reducer', signinReducer)
// Combine Reducers
var reducers = combineReducers({
    controller,
    // members,
    // walks,
    // accounts,
    // membersList,
    // paymentsSummary,
    // lock: lockReducer,
    // signin: signinReducer,
    // // replicator,
    // router,
    // // uiState,
    // // routing: routerReducer,
    // // form: form,
    // form: formReducer
    // .plugin({
    //   EditMemberData: (state, action) => { // <------ 'account' is name of form given to reduxForm()
    //   switch(action.type) {
    //     // case 'MEMBERS_EDIT_SETSHOWMODAL':
    //     //   return action.payload ? state : undefined;       // <--- blow away form data
    //     case 'MEMBERS_LIST_SET_DISPLAYED_MEMBER':
    //       return undefined;       // <--- blow away form data
    //     default:
    //       return state;
    //   }
    // }
  // }),
});
export default reducers;
