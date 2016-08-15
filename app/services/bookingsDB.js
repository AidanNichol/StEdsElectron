
var PouchDB  = require('pouchdb');
// var PouchDBa  = require('pouchdb-authentication');
export var remoteCouch = 'http://aidan:admin@localhost:5984/bookings';
var db;
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:red;', 'DBbookings');


console.log('PouchDB creating');



// db = new PouchDB('http://localhost:5984/bookings', {user: 'aidan', password: 'admin'});
// db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});
db = new PouchDB('stEdsBookings', {});
window.PouchDB = PouchDB;
logit('window', window);
// sync();
console.log('PouchDB created', db);
db.info().then(function(info) {console.info('Bookings Info', info);});
PouchDB.debug.disable();
PouchDB.debug.enable('pouchdb:*');
import pouchSeed from 'pouchdb-seed-design';
import ddoc from 'services/designDocs'


pouchSeed(db, ddoc).then(function(updated) {
  if(updated) {
    console.log('DDocs updated!');
  } else {
    console.log('No update was necessary');
  }
});
export default db;
