#!/usr/bin/env node
// import Logit from 'logit';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');
// var prettyFormat = require('pretty-format')

var PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-http'))
  .plugin(require('pouchdb-replication'));

var replicationStream = require('pouchdb-replication-stream');
var MemoryStream = require('memorystream');

PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);
var stream = new MemoryStream();

const settingsFile = '/Users/aidan/Library/Preferences/stedsbookings-nodejs/config.json';
const fs = require('fs');
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});
(async function() {
  try {
    var source = new PouchDB('http://nicholware.com:5984/bookings', {});
    console.log('reading live');
    var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await db.destroy();
    let dest = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await dest.compact();
    var settingsStr = fs.readFileSync(settingsFile);
    var settings = JSON.parse(settingsStr);
    settings.database.developement.resetLocalBookings = true;
    settings.database.current = 'developement';
    fs.writeFileSync(settingsFile, JSON.stringify(settings));
    await Promise.all([source.dump(stream), dest.load(stream)]);
    console.log('Hooray the stream replication is complete!');
    const info = await dest.info();
    console.log('info', info);
    console.log('Yey, story successfully loaded!');
  } catch (e) {
    console.error('oh no an error', e);
  }
})();
