#!/usr/bin/env node
const fs = require('fs');
var PouchDB = require('pouchdb');
var replicationStream = require('pouchdb-replication-stream');

PouchDB.plugin(replicationStream.plugin);

const filename = ''; // set to name of backup that will be restored
var stream = fs.createReadStream(filename);
var live = new PouchDB('http://nicholware.com:5984/bookings', {});
// var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});

(async function() {
  try {
    console.log('reading live');
    const res = await live.load(stream);
    console.log('Yey, db successfully loaded!', res);
  } catch (e) {
    console.error('oh no an error', e);
  }
})();
