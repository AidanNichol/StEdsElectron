/* global PouchDB */
// export var PouchDB  = require('pouchdb-browser');

// export var PouchDB  = require('pouchdb-core')
//                   .plugin(require('pouchdb-adapter-websql'))
//                   .plugin(require('pouchdb-adapter-http'))
//                   .plugin(require('pouchdb-replication'));

// var PouchDBa  = require('pouchdb-authentication');
// export var remoteCouch = 'http://aidan:admin@localhost:5984/bookings';
// var PouchDB = require('pouchdb')
//   // .plugin(require('pouchdb-adapter-websql'))
//   // .plugin(require('pouchdb-adapter-http'))
//   .plugin(require('pouchdb-authentication'));

PouchDB.plugin(require('pouchdb-authentication'));
var db;
const { getSettings, setSettings, DbSettings, mode } = require('../ducks/settings-duck');
const { remote } = require('electron');
const BrowserWindow = remote && remote.BrowserWindow;
const Logit = require('logit.js');
var logit = Logit(__filename);
const adapter = DbSettings.adapter || 'websql';

logit('PouchDB creating', PouchDB);

logit('DbSettings', mode, DbSettings);
const localDb = DbSettings.localname;
logit('localDb', localDb, adapter);

db = new PouchDB(localDb, { adapter });
if (DbSettings.resetLocalBookings && BrowserWindow) {
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
module.exports = db;
// export const remoteCouch = `http://${DbSettings.remotehost}:5984/${
//   DbSettings.remotename
// }`;

// export PouchDB;
