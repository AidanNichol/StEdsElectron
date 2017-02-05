import db from '../services/bookingsDB.js';

import Logit from '../factories/logit.js';
import WS from 'mobx/WalksStore'
import MS from 'mobx/MembersStore'
import AS from 'mobx/AccountsStore'

var storeFn = {
  walk: WS.changeDoc,
  account: AS.changeDoc,
  member: MS.changeDoc,
  paymentSummary: AS.changeBPdoc,
};

var logit = Logit('color:white; background:navy;', 'SyncDoc');
const collections = {M: 'member', W: 'walk', A: 'account', BP: 'bankPayments', BS: 'bankSubscriptions'};

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
    if (change.id[0] === '_' || (change.doc && !change.doc.type))continue;
    var collection = (change.doc && change.doc.type) || collections[change.id.match(/$([A-Z]+)/)[0]];
    logit('change', {change, collection});
    if (storeFn[collection]){
      storeFn[collection](change) // update Mobx store
    }
    if (change.deleted){
      const req = change.id.match(/$([A-Z]+)/)[0];
      collection = collections[req];
      logit('collection', req, collection);
      if (collection){
        yield put({type: `delete_${collection}_doc`, id: change.id});
      }

    }
    else {
      collection = change.doc.type;
      yield put({type: `change_${change.doc.type}_doc`, doc: change.doc})
    }
  }
}
