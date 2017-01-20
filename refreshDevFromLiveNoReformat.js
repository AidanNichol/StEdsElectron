// import Logit from 'factories/logit.js';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');

// var prettyFormat = require('pretty-format')
var PouchDB  = require('pouchdb');
// import fs from 'fs'
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});

(async function() {
  try {
    var livedb = new PouchDB('http://nicholware.com:5984/bookings', {});
    console.log('reading live')
    var data = await livedb.allDocs({include_docs: true})
    var docs =data.rows.filter(row=>row.doc).map(row=>row.doc);
    console.log('docs', docs.length)
    var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await db.destroy();
    db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await db.compact();
    console.log('read live. docs:',docs.length)

    let res = await db.bulkDocs(docs, {new_edits: false})
    console.log('result', res)
    const info = await db.info()
    console.log('info', info)

  } catch (e) {
    console.error('error', e);
  }
  console.log("Yey, story successfully loaded!");
}());
