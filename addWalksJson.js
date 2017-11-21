// import Logit from 'factories/logit.js';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');
// var prettyFormat = require('pretty-format')
var PouchDB = require('pouchdb');
var fs = require('fs');
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});

(async function() {
  try {
    var db = new PouchDB('http://nicholware.com:5984/bookings', {});
    var data = fs.readFileSync('./stedsWalks.json');
    var docs = JSON.parse(data).docs;
    // for (let doc of docs) {
    //   let docM = await db.get(doc._id);
    //   doc._rev = docM._rev;
    // }
    console.log('read live. docs:', docs.length);

    let res = await db.bulkDocs(docs);
    console.log('result', res);
    const info = await db.info();
    console.log('info', info);
    console.log('Yey, story successfully loaded!');
  } catch (e) {
    console.error('error', e);
  }
})();
