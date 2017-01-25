// import Logit from 'factories/logit.js';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');

// var prettyFormat = require('pretty-format')
var PouchDB  = require('pouchdb');
import XDate from 'xdate'
import fs from 'fs'
var db = new PouchDB('http://nicholware.com:5984/bookings', {});
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});
const dat = new XDate().toString('MMM-dd HH:mm');

(async function() {
  try {
    console.log('reading live')
    var data = await db.allDocs({include_docs: true})
    var docs =data.rows.filter(row=>row.doc).map(row=>row.doc);
    console.log('docs', docs.length)
    fs.writeFileSync(`./backup/preRevertDev${dat}.json`, JSON.stringify(docs))
    await loadWalks(db);
    await loadAccs(db);
    // let res = await db.bulkDocs(docs, {new_edits: false})
    // console.log('result', res)
    const info = await db.info()
    console.log('info', info)

  } catch (e) {
    console.error('error', e);
  }
  // finally {
  //
  // }

  console.log("Yey, story successfully loaded!");
}());

async function loadWalks(db){
  try {
    let data = await db.allDocs({ startkey: "W0000", endkey: "W9999", include_docs: true });

    let docs = data.rows
          .filter(row => row.doc.type === 'walk')
          .map(row => {
            if (!row.doc.booked)row.doc.booked = {};
            if (!row.doc.annotations)row.doc.annotations = {};
            let newDoc = revertWalkDoc(row.doc)
            return newDoc})

    // console.log(docs)
    await db.bulkDocs(docs)
    console.log(`updated ${docs.length} walk documents`)
  } catch (e) {
    console.error('error', e);
  }
}


async function loadAccs(db){
  try {
    let data = await db.allDocs({ startkey: "A0000", endkey: "A9999", include_docs: true });

    let docs = data.rows
          .filter(row => row.doc.type === 'account')
          .map(row => {
            if (!row.doc.log)row.doc.log = [];
            let newDoc = revertAccDoc(row.doc)
            return newDoc})

    // console.log(docs)
    await db.bulkDocs(docs)
    console.log(`updated ${docs.length} account documents`)

  } catch (e) {
    console.error('error', e);
  }
}

const revertAccDoc = (doc)=>{
  let logs =[];
  for(let log of doc.logs||[]){
    let {dat, who, req, amount, note} = log;
    if (req[1]==='X')amount *= -1;
    req = 'P';
    if (note && note === '')note = undefined;
    let newLog = [dat, who, null, null, req, amount, note];
    logs.push(newLog);
  }
  doc.log = logs.sort(logCmpDate);
  // delete doc.logs;
  // if (doc._id==='A853')console.log('revertWalkDoc:doc', prettyFormat(doc))
  return doc;
};

const revertWalkDoc = (doc)=>{
  let booked = {};
  let log = [];
  let annotations = {}
  // if (doc._id==='W2016-12-17')console.log('revertWalkDoc:doc', doc,bookings);

  for(let [memId, booking] of Object.entries(doc.bookings||{})){
    if (booking.annotation)annotations[memId] = booking.annotations;
    if (booking.logs)log = log.concat(booking.logs.map(log=>{
      let {dat, who, req, note} = log;
      return [dat, who, memId, req, note];
    }));
    booked[memId] = booking.status;
  }

  // delete doc.bookings;
  doc.booked = booked;
  doc.log = log.sort(logCmpDate);
  doc.annotations = annotations;
  return doc;

}
var coll = new Intl.Collator();
var logCmpDate = (a, b) => coll.compare(a[0], b[0]);
// var cmpDate = (a, b) => coll.compare(a.dat, b.dat);
