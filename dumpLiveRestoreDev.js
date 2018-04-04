// import Logit from 'factories/logit.js';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');
// var prettyFormat = require('pretty-format')
var PouchDB = require('pouchdb');
var replicationStream = require('pouchdb-replication-stream');
var MemoryStream = require('memorystream');

PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);
var stream = new MemoryStream();

PouchDB.plugin(replicationStream.plugin);

import fs from 'fs';
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});

(async function() {
  try {
    var source = new PouchDB('http://nicholware.com:5984/bookings', {});
    console.log('reading live');
    var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await db.destroy();
    let dest = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await dest.compact();
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
    await Promise.all([source.dump(stream), dest.load(stream)]);
    console.log('Hooray the stream replication is complete!');
    const info = await dest.info();
    console.log('info', info);
    console.log('Yey, story successfully loaded!');
  } catch (e) {
    console.error('oh no an error', e);
  }
})();
