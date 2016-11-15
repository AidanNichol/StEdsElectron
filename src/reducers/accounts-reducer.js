import * as i from 'icepick';
import Logit from '../factories/logit.js';
import {setPage} from '../ducks/router-duck.js';
var logit = Logit('color:white; background:black;', 'Accounts:Reducer');

  export default function(state = {list: {}, current:{}}, action) {
    switch(action.type) {

    case 'ACCOUNT_DOCS_LOAD':
      var accounts = {};
      action.docs.forEach(doc => {accounts[doc._id] = doc;});
      return i.set(state, 'list', accounts);
      // return state.set('list', accounts);

    case 'delete_account_doc':
      return i.dissoc(state, action.id);

    case 'change_account_doc':
      if (state[action.doc._id] && action.doc._rev === state.list[action.doc._id]._rev) return state;
      return i.setIn(state, ['list', action.doc._id], action.doc);

    case 'ACCOUNT_SELECTED':
      logit('action', action, state.list);
      return i.set(state, 'current', action.value);
      // return state.set('current', action.value);

    // case 'ACCOUNT_SELECTED_SHOW_BOOKINGS':
    //   logit('action', action, state.list);
    //   dispatch(setPage({page:'bookings', accountId: action.value}));
    //   return i.set(state, 'current', action.value);
    //   // return state.set('current', action.value);

    }
    return state;
  }
