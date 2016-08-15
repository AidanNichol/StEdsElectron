// import * as i from 'icepick';
// // import { createReducer } from 'redux-act';
// // import * as actions from 'actions/walks-actions';
// import {now, getTodaysDate} from 'utilities/DateUtilities';
// import Logit from 'factories/logit.js';
// var logit = Logit('color:white; background:black;', 'WalksReducer');
//
// var _now = now();
// var _today = getTodaysDate();
//
// logit('loaded', null);
//   export default function(state = {list: {}, annotate: {}, current:{}}, action) {
//     switch(action.type) {
//
//       case 'WALK_DOCS_LOADED':
//         var list = {};
//         var bookable = [];
//         logit('list', {action, _now, _today});
//         action.docs.forEach(doc => {
//           if (!doc.walkDate)doc.walkDate=doc._id.substr(1);
//           if (doc.firstBooking > _now)return;
//           if (doc._id.substr(1) >= _today)bookable.push(doc._id);
//           list[doc._id] = doc;
//         });
//         logit('newstate', {list, bookable});
//         var current = bookable[0];
//         return i.assign(state, {list, bookable, current});
//         // return state.merge({list, bookable, current});
//       case 'change_walk_doc':
//         if (state[action.doc._id] && action.doc._rev === state.list[action.doc._id]._rev) return state;
//         return i.setIn(state, ['list', action.doc._id], action.doc);
//         // return state.setIn(['list', action.doc._id], action.doc);
//       case 'WALK_SELECTED':
//         logit('action', action, state.list);
//         return i.set(state, 'current', action.walkId);
//         // return state.set('current', action.walkId);
//       default:
//         return state;
//     }
//     return state;
//   }
