/* global PouchDB */
// export var PouchDB  = require('pouchdb-browser');

// export var PouchDB  = require('pouchdb-core')
//                   .plugin(require('pouchdb-adapter-websql'))
//                   .plugin(require('pouchdb-adapter-http'))
//                   .plugin(require('pouchdb-replication'));

// var PouchDBa  = require('pouchdb-authentication');
// export var remoteCouch = 'http://aidan:admin@localhost:5984/bookings';
PouchDB.plugin(require('pouchdb-authentication'));
var db;
import { getSettings, setSettings, DbSettings, mode } from 'ducks/settings-duck';
import { remote } from 'electron';
const BrowserWindow = remote.BrowserWindow;
import Logit from '../factories/logit.js';
var logit = Logit(__filename);
const adapter = DbSettings.adapter || 'websql';

logit('PouchDB creating', PouchDB);

// import { uuid } from 'PouchDB-utils';
// async function tests() {
//   try {
//     const logit = Logit(`${__filename}_XYZW`);
//     var test = await new PouchDB('test', {});
//     await test.destroy();
//     test = await new PouchDB('test', {});
//     let info = await test.info();
//     logit('info', info);
//     var uuidx = uuid(32, 16).toLowerCase();
//     logit('uuidx', uuidx);
//     var id = 'test6';
//     await test.put({ _id: id, value: 1 });
//     let doc = await test.get(id);
//     logit('version 1', doc);
//     var rev = parseInt(doc._rev.split('-')[0]);
//     doc._rev = rev + 1 + '-' + uuid(32, 16).toLowerCase();
//     doc.value += 1;
//     await test.bulkDocs([doc], { new_edits: false });
//     doc = await test.get(id);
//     logit('version 2', doc);
//     info = await test.info();
//     logit('info', info);
//   } catch (error) {
//     logit('error', error);
//   }
// }
// tests();
logit('DbSettings', mode, DbSettings);
const localDb = DbSettings.localname;
logit('localDb', localDb, adapter);

db = new PouchDB(localDb, { adapter });
if (DbSettings.resetLocalBookings) {
  logit('destroying', localDb);
  db.destroy().then(() => {
    setSettings(`database.${getSettings('database.current')}.resetLocalBookings`, false);
    logit('destroyed ' + localDb, 'Reloading');
    localStorage.removeItem('stEdsReplSeq');
    BrowserWindow.getFocusedWindow().reload();

    logit('creating', localDb);
    db = new PouchDB(localDb, { adapter });
    logit('created', localDb);
  });
}

window.PouchDB = PouchDB;
logit('window', window);
// sync();
logit('PouchDB created', db);
db.info().then(function(info) {
  logit('Bookings Info', info);
});

// PouchDB.debug.disable();
// getSettings('debug.database') && PouchDB.debug.enable('pouchdb:*');
// import pouchSeed from 'pouchdb-seed-design';
// import ddoc from '../services/designDocs';

// pouchSeed(db, ddoc).then(function(updated) {
//   if (updated) {
//     logit('DDocs updated!');
//   } else {
//     logit('No update was necessary');
//   }
// });
export default db;
export const remoteCouch = `http://${DbSettings.remotehost}:5984/${
  DbSettings.remotename
}`;

// export PouchDB;
