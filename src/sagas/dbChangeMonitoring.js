import { call, put, take } from 'redux-saga/effects.js';
import db from '../services/bookingsDB.js';
// import createChannel from '../services/channel.js';
import { eventChannel, END, buffers } from 'redux-saga'


import Logit from '../factories/logit.js';
var logit = Logit('color:white; background:navy;', 'SyncDoc');
const collections = {'M': 'member', 'W': 'walk', 'A': 'account'};

// lastSeq = 138;

function createChangeChannel (lastSeq) {
  // every change event will call put on the channel
  let subscriber = (emitter)=>{
    let monitor = db.changes({ since: lastSeq, live: true, timeout: false, include_docs: true })
      .on('change', (info)=>emitter(info))
      .on('complete', ()=>emitter(END))
      .on('error', error => logit('changes_error', error));

      // The subscriber must return an unsubscribe function
      return () => monitor.cancel();
    };
  return eventChannel(subscriber, buffers.fixed());

}

export default function * monitorChanges () {
  const info = yield call([db, db.info]);
  logit('info', info);
  let lastSeq = info.update_seq;
  // lastSeq = 138;
  const channel = yield call(createChangeChannel, lastSeq);

  while (true) { // eslint-disable-line no-constant-condition
    const change = yield take(channel); // Blocks until the promise resolves
    logit('change', change);
    if (change.deleted){
      var collection = collections[change.id[0]];
      logit('collection', collection);
      if (collection){
        yield put({type: `delete_${collection}_doc`, id: change.id});
      }

    }
    else yield put({type: `change_${change.doc.type}_doc`, doc: change.doc});
  }
}


// export default  function * monitorChanges() {
//   var info = yield call([db, db.info]);
//   logit('info cps', info);
//   let lastSeq = info.update_seq;
//   let count = 0;
//
//   while(1){
//     try{
//       var changes = yield call([db, db.changes], { since: lastSeq, continuous: true, limit: 1, include_docs: true, heartbeat: 20000 });
//       logit('changes cps', changes, lastSeq);
//       if (changes && changes.results.length > 0){
//         for(let i = 0; i < changes.results.length; i++){
//           var change=changes.results[i];
//           if (change.deleted){
//             var collection = collections[change.id[0]];
//             if (collection){
//               yield put({type: `delete_${collection}_doc`, id: change.id});
//             }
//           }
//           else yield put({type: `change_${change.doc.type}_doc`, doc: change.doc, count: count});
//           lastSeq = changes.last_seq;
//         }
//       }
//       else yield call(delay, 3000);
//     }catch (error){
//       logit('change-error', error);
//       yield put({type: 'monitor-changes-error', err: error})
//     }
//   }
// }
