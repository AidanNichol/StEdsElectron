import db from '../services/bookingsDB.js';
// import createChannel from '../services/channel.js';

import Logit from '../factories/logit.js';
import WS from 'mobx/WalksStore';
import MS from 'mobx/MembersStore';
import AS from 'mobx/AccountsStore';

var storeFn = {
  walk: WS.changeDoc,
  account: AS.changeDoc,
  member: MS.changeDoc,
  paymentSummary: AS.changeBPdoc
};

var logit = Logit('color:white; background:navy;', 'SyncDoc');
const collections = {
  M: 'member',
  W: 'walk',
  A: 'account',
  BP: 'bankPayments',
  BS: 'bankSubscriptions'
};

// lastSeq = 138;

export async function monitorChanges() {
  const info = await db.info();
  logit('info', info);
  let lastSeq = info.update_seq;
  // lastSeq = 138;
  let monitor = db
    .changes({ since: lastSeq, live: true, timeout: false, include_docs: true })
    .on('change', info => handleChange(info))
    .on('complete', () => {})
    .on('error', error => logit('changes_error', error));

  // The subscriber must return an unsubscribe function
  return () => monitor.cancel();
}

const handleChange = change => {
  if (change.id[0] === '_' || (change.doc && !change.doc.type)) return;
  var collection =
    (change.doc && change.doc.type) ||
    collections[change.id.match(/$([A-Z]+)/)[0]];
  logit('change', { change, collection });
  if (storeFn[collection]) {
    storeFn[collection](change); // update Mobx store
  }
};
