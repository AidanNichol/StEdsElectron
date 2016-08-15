// import db from 'services/bookingsDB';
// import * as i from 'icepick';
// import {getLastAvailableDate, getTodaysDate} from 'utilities/DateUtilities';
// import Logit from '../factories/logit.js';
// var logit = Logit('color:white; background:navy;', 'InitialLoad');
//
//
//
//   const loadMembers = function loadMembers(){
//     return db.allDocs( {include_docs: true, startkey: 'M', endkey: 'M9999999' })
//     .then((data)=>{
//       return data.rows.filter(row => row.doc.type === 'member').map(row => row.doc);
//     });
//   };
//
//   const loadAccounts = function loadAccounts(){
//     return db.allDocs( {include_docs: true, startkey: 'A', endkey: 'A9999999' }).then((data=>{
//       return data.rows.filter(row => row.doc.type === 'account').map(row => row.doc);
//     }));
//   };
//
//   const loadWalks = function loadWalks(){
//     var _lastAvailableDate = getLastAvailableDate();
//     var _today = getTodaysDate();
//     var docs1 = [];
//     // var _getPrevDate = getPrevDate();
//     // var _today = XDate.today().toString('yyyy-MM-dd');
//     // var _lastAvailableDate = XDate.today().addDays(42).toString('yyyy-MM-dd');
//     const filterCurrentWalks = {
//       // startkey: "W"+_getPrevDate,
//       startkey: "W"+_today,
//       endkey: "W"+_lastAvailableDate,
//       include_docs: true
//     };
//     logit('filterCurrentWalks', filterCurrentWalks);
//     return db.allDocs(filterCurrentWalks)
//       .then((data)=> data.rows.filter(row => row.doc.type === 'walk').map(row => row.doc))
//       .then((docs)=>{
//         docs1 = docs;
//         const filterPrevWalks = {
//           startkey: "W"+docs[0].firstBooking,
//           endkey: "W"+_today,
//           include_docs: true
//         };
//         logit('filterPrevWalks', filterPrevWalks);
//         return db.allDocs(filterPrevWalks);
//
//       })
//       .then((data)=> data.rows.filter(row => row.doc.type === 'walk').map(row => row.doc).concat(docs1))
//
//
//     };
//
//
//     export default Promise.all([ loadMembers(), loadAccounts(), loadWalks() ])
//       .then((data)=>{
//         var [memberDocs, accountDocs, walkDocss] = data;
//
//         const membersList = {list: memberDocs, currentPage: 1, dispStart: 0, dispLength: 20, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false};
//         // const membersList = Immutable({list: [], currentPage: 1, dispStart: 0, dispLength: 20, displayMember: 0, sMember: 0, sortProp: 'name', showEditMemberModal: false, showModal: false});
//         // const messages = {};
//         var accounts = {};
//         accountDocs.forEach(doc => {accounts[doc._id] = doc;});
//         return i.set(state, 'list', accounts);
//         const logon = {};
//         const walks = i.freeze({list: {}});
//         // const walks = Immutable({list: {}});
//         const accounts = i.freeze({list: {}});
//         const controller = i.freeze({addToWaitList: false});
//
//
//         var list = {};
//         var bookable = [];
//         logit('list', {action, _now, _today});
//         action.docs.forEach(doc => {
//           if (!doc.walkDate)doc.walkDate=doc._id.substr(1);
//           if (doc.firstBooking > _now)return;
//           if (doc._id.substr(1) >= _today)bookable.push(doc._id);
//           list[doc._id] = doc;
//         });
//         return   {membersList, logon, walks, accounts, controller};
//
//
//       });
//
//   // } catch(error){
//   //   yield put({ type: 'INITIAL_SAGA_FAILED', error});
//   // }
