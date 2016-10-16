/* global PouchDB */
// export var PouchDB  = require('pouchdb');

// export var PouchDB  = require('pouchdb-core')
//                   .plugin(require('pouchdb-adapter-websql'))
//                   .plugin(require('pouchdb-adapter-http'))
//                   .plugin(require('pouchdb-replication'));

// var PouchDBa  = require('pouchdb-authentication');
// export var remoteCouch = 'http://aidan:admin@localhost:5984/bookings';
var db;
import Logit from '../factories/logit.js';
var logit = Logit('color:white; background:red;', 'DBbookings');


console.log('PouchDB creating', PouchDB);

// import {uuid} from 'PouchDB-utils';
// var test = new PouchDB('test', {});
// test.destroy();
// var uuidx = uuid(32, 16).toLowerCase();console.log('XYZW', uuidx);
// var id = 'test6';
// test.put({_id: id, value: 1}).then(function(){
//     return test.get(id);
//   }) .then(function(doc) {
//   console.log('XYZW version 1', doc);
//   var rev = parseInt(doc._rev.split('-')[0]);
//   doc._rev=(rev+1)+'-'+uuid(32,16).toLowerCase();
//   doc.value += 1;
//   return test.bulkDocs([doc], {new_edits: false});
// }).then(function() {
//   return test.get(id);
// }).then(function(doc) {
//   console.log('XYZW version 2', doc);
// }).catch(function(error){console.error('XYZW error', error)});



// db = new PouchDB('http://localhost:5984/bookings', {user: 'aidan', password: 'admin'});
// db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});
db = new PouchDB('stEdsBookings', {adapter: 'websql'});
window.PouchDB = PouchDB;
logit('window', window);
// sync();
console.log('PouchDB created', db);
db.info().then(function(info) {console.info('Bookings Info', info);});

PouchDB.debug.disable();
// PouchDB.debug.enable('pouchdb:*');
import pouchSeed from 'pouchdb-seed-design';
import ddoc from '../services/designDocs'


pouchSeed(db, ddoc).then(function(updated) {
  if(updated) {
    console.log('DDocs updated!');
  } else {
    console.log('No update was necessary');
  }
});
export default db;
