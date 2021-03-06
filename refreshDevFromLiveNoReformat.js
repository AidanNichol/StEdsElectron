// import Logit from 'logit';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');
// var prettyFormat = require('pretty-format')
var PouchDB = require('pouchdb');
import fs from 'fs';
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});

(async function() {
  try {
    var livedb = new PouchDB('http://nicholware.com:5984/bookings', {});
    console.log('reading live');
    var data = await livedb.allDocs({ include_docs: true });
    var docs = data.rows
      .filter(row => row.doc)
      .map(row => row.doc)
      .filter(doc => doc._id !== '_design/bookings');
    console.log('docs', docs.length);
    var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await db.destroy();
    db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await db.compact();
    var settingsStr = fs.readFileSync(
      '/Users/aidan/Library/Application Support/Electron/Settings',
    );
    var settings = JSON.parse(settingsStr);
    settings.database.developement.resetLocalBookings = true;
    settings.database.current = 'developement';
    fs.writeFileSync(
      '/Users/aidan/Library/Application Support/Electron/Settings',
      JSON.stringify(settings),
    );
    console.log('read live. docs:', docs.length);

    let res = await db.bulkDocs(docs, { new_edits: false, timeout: false });
    console.log('result', res);
    const info = await db.info();
    console.log('info', info);
    console.log('Yey, story successfully loaded!');
  } catch (e) {
    console.error('error', e);
  }
})();
