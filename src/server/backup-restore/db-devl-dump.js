#!/usr/bin/env node
var PouchDB = require('pouchdb');
var replicationStream = require('pouchdb-replication-stream');
var XDate = require('xdate');

PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);

PouchDB.plugin(replicationStream.plugin);

const fs = require('fs');
const now = new XDate().toString('yyyy-MM-dd_HH-mm-ss');
const filename = `backup-development-${now}.txt`;
var stream = fs.createWriteStream(filename);
(async function() {
  try {
    var development = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    console.log('reading development db');
    const res = await development.dump(stream);
    console.log('Hooray the stream replication is complete!', filename, res);
    // await development.compact();
  } catch (e) {
    console.error('oh no an error', e);
  }
})();
