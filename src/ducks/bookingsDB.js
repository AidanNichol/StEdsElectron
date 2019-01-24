const PouchDB = require('pouchdb-browser');
PouchDB.plugin(require('pouchdb-authentication'));
var db;

const { getSettings, setSettings, DbSettings, mode } = require('StEdsSettings');
const { remote } = require('electron');
const BrowserWindow = remote && remote.BrowserWindow;
const logit = require('logit')(__filename);
// const adapter = DbSettings.adapter || 'idb';
const adapter = 'idb';

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

module.exports = db;

