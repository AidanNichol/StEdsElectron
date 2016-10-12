import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'
import {reducer as formReducer} from 'redux-form';
// import {properCaseName, properCaseAddress, normalizePhone} from '../components/utility/normalizers.js';

// Reducers
import members from '../reducers/members-reducers.js';
import walks from '../ducks/walksDuck.js';
import accounts from '../reducers/accounts-reducer.js';
// import membersList from '../reducers/memberslist-reducers.js';
import membersList from '../ducks/memberslist-duck';
import currentMember from '../reducers/currentMember-reducers.js';
import {reducer as signinReducer } from '../ducks/signin-duck.js';
import controller from '../reducers/controller-reducers.js';
import replicator from '../ducks/replication-duck.js';
console.log('signin reducer', signinReducer)
// Combine Reducers
var reducers = combineReducers({
    controller,
    members,
    walks,
    accounts,
    membersList,
    currentMember,
    signin: signinReducer,
    replicator,
    routing: routerReducer,
    // form: form,
    form: formReducer
    // .normalize({
    //
    //   EditMemberData: {                                    // <--- name of the form
    //     // firstName: properCaseName,
    //     lastName: properCaseName,
    //     // // address: properCaseAddress,
    //     phone: normalizePhone,                          // normalizer for 'phone' field
    //   }
    // })
    .plugin({
      EditMemberData: (state, action) => { // <------ 'account' is name of form given to reduxForm()
      switch(action.type) {
        // case 'MEMBERS_EDIT_SETSHOWMODAL':
        //   return action.payload ? state : undefined;       // <--- blow away form data
        case 'MEMBERS_LIST_SET_DISPLAYED_MEMBER':
          return undefined;       // <--- blow away form data
        default:
          return state;
      }
    }
  }),
});
export default reducers;
