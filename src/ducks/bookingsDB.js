const PouchDB = require('pouchdb-browser');
PouchDB.plugin(require('pouchdb-authentication'));
export var db;

const { getSettings, setSettings, DbSettings, mode } = require('StEdsSettings');
const { remote } = require('electron');
const BrowserWindow = remote && remote.BrowserWindow;
const logit = require('logit')(__filename);
// const adapter = DbSettings.adapter || 'idb';
let adapter = 'idb';
process.env.STEDS_db_ready = 'No';
let db_ready = false;
logit('PouchDB creating', 'ready:' + process.env.STEDS_db_ready, PouchDB);

logit('DbSettings', mode, DbSettings);
const { remotehost, remotename, localname, resetLocalBookings } = DbSettings;
export const bypasslocal = DbSettings.bypasslocal;
if (bypasslocal) logit('=====bypasslocal===========', bypasslocal);
let dbName;
process.env.STEDS_bypasslocal = bypasslocal ? 'true' : 'false';
if (bypasslocal) {
  dbName = `http://${remotehost}:5984/${remotename}`;
  adapter = 'http';
} else {
  dbName = localname;
  adapter = 'idb';
}
logit('Openning', dbName, adapter);
const getDB = async () => {
  // db = new PouchDB(localDb, { adapter });
  db = new PouchDB(dbName, { adapter });
  if (resetLocalBookings && !bypasslocal && BrowserWindow) {
    logit('destroying', localname);
    await db.destroy();
    setSettings(`database.${getSettings('database.current')}.resetLocalBookings`, false);
    logit('destroyed ' + localname, 'Reloading');
    localStorage.removeItem('stEdsReplSeq');
    BrowserWindow.getFocusedWindow().reload();

    logit('creating', localname);
    db = new PouchDB(localname, { adapter });
  }
  logit('created', dbName);

  const info = await db.info();
  logit('Bookings Info', info);

  process.env.STEDS_db_ready = 'Yes';
  db_ready = true;
  logit('PouchDB created', 'ready:' + process.env.STEDS_db_ready, db);
};

window.PouchDB = PouchDB;
logit('window', window);
getDB();
const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
export const waitForDB = who => {
  return new Promise(async resolve => {
    let i = 0;
    while (!db_ready) {
      logit('db_ready ' + who, db_ready);
      await sleep(1000);
      if (i++ > 120) break;
    }
    logit('db_ready ' + who, db_ready);
    resolve();
  });
};

// module.exports = db;
