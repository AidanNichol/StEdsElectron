#!/usr/bin/env node
var PouchDB = require('pouchdb');
var replicationStream = require('pouchdb-replication-stream');
var XDate = require('xdate');

PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);

PouchDB.plugin(replicationStream.plugin);

const fs = require('fs');
const now = new XDate().toString('yyyy-MM-dd_HH-mm-ss');
const filename = `backup-production-${now}.txt`;

var stream = fs.createWriteStream(filename);
(async function() {
  try {
    var production = new PouchDB('http://nicholware.com:5984/bookings', {});
    // var development = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    console.log('reading production db');
    const res = await production.dump(stream);
    console.log('Hooray the stream replication is complete!', res);
    // await production.compact();
  } catch (e) {
    console.error('oh no an error', e);
  }
})();
