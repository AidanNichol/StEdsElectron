import * as i from 'icepick';
// import * as types from '../actions/action-types';
// import _ from 'lodash';
// import Immutable from 'seamless-immutable';

const membersReducer = function(state = {}, action) {

  switch(action.type) {

    case 'MEMBER_DOCS_LOAD':
      var members = {};
      action.docs.forEach(doc => {
        if (!doc.accountId) doc.accountId = doc.account;
        members[doc._id] = doc;
      });
      return i.freeze(members);
    case 'change_member_doc':
      if (state[action.doc._id] && action.doc._rev === state[action.doc._id]._rev) return state;
      return i.set(state, action.doc._id, action.doc);
      // return state.set(action.doc._id, action.doc);
    case 'delete_member_doc':
      return i.dissoc(state, action.id);
      // return state.without(action.id);
  }

  return state;

}

export default membersReducer;
