import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'
import {reducer as formReducer} from 'redux-form';
// import {properCaseName, properCaseAddress, normalizePhone} from 'components/utility/normalizers';

// Reducers
import members from 'reducers/members-reducers';
import walks from 'ducks/walksDuck';
import accounts from 'reducers/accounts-reducer';
import membersList from 'reducers/memberslist-reducers';
import currentMember from 'reducers/currentMember-reducers';
import logon from 'ducks/login-duck';
import controller from 'reducers/controller-reducers';
import replicator from 'ducks/replication-duck';

// Combine Reducers
var reducers = combineReducers({
    controller,
    members,
    walks,
    accounts,
    membersList,
    currentMember,
    logon,
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
