// import * as types from '../actions/action-types';
// import _ from 'lodash';



export default function(state = {}, action) {

  switch(action.type) {

    case 'crap':
      var members = {};
      action.docs.forEach(doc => {members[doc._id] = doc;});
      return members;
    case 'crapx':
      var new_state = {...state};
      new_state[action._id] = action;
      return new_state;
    // case types.DELETE_USER_SUCCESS:
    //
    //   // Use lodash to create a new user array without the user we want to remove
    //   const newUsers = _.filter(state.users, user => user.id != action.userId);
    //   return Object.assign({}, state, { users: newUsers });
    //
    // case types.USER_PROFILE_SUCCESS:
    //   return Object.assign({}, state, { userProfile: action.userProfile });

  }

  return state;

}
