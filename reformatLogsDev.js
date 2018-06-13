// import Logit from 'logit';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');

// var prettyFormat = require('pretty-format')
var PouchDB  = require('pouchdb');
import fs from 'fs'
var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});

(async function() {
  try {
    console.log('reading dev')
    var data = await db.allDocs({include_docs: true})
    var docs =data.rows.filter(row=>row.doc).map(row=>row.doc);
    console.log('docs', docs.length)
    fs.writeFileSync('./backup/preReformatDev.json')
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
            let newDoc = reformatWalkDoc(row.doc)
            return newDoc})

    // console.log(docs)
    await db.bulkDocs(docs)
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
            let newDoc = reformatAccDoc(row.doc)
            return newDoc})

    // console.log(docs)
    await db.bulkDocs(docs)
  } catch (e) {
    console.error('error', e);
  }
}

const reformatAccDoc = (doc)=>{
  let logs =[];
  for(let log of doc.log||[]){
    let [dat, who, , , req, amount, note] = log;
    if (!who||who==='???')who='M1180';
    if (note && note !== ''){
      if (/Credit/i.test(note))req = '+';
      if (/BACS/i.test(note))req = 'T';
    }
    if (amount < 0){
      amount *= -1;
      req = req+"X";
    }
    var newLog = {dat, who, req, amount, type:'A'};
    if (note && note !== '')newLog.note = note;
    // if (memId && memId !== '')newLog.memId = memId;
    // if (walkId && walkId !== '')newLog.walkId = walkId;
    logs.push(newLog);
  }
  doc.logs = logs;
  delete doc.log;
  // if (doc._id==='A853')console.log('reformatWalkDoc:doc', prettyFormat(doc))
  return doc;
};

const reformatWalkDoc = (doc)=>{
  let bookings = {};
  // if (doc._id==='W2016-12-17')console.log('reformatWalkDoc:doc', doc,bookings);

  for(let memId of Object.keys(doc.booked||{})){
    bookings[memId] = {status: doc.booked[memId], logs:[]}
  }
  // if (doc._id==='W2016-12-17')console.log('reformatWalkDoc:doc', doc,bookings);
  for(let log of doc.log||[]){
    let [dat, who, memId, req, note] = log
    let newLog = {dat, who, req}
    if (note && note!=='')newLog.note = note;
    if (!bookings[memId])bookings[memId] = {status: 'BX',  logs: []};
    bookings[memId].logs.push(newLog);
  }
  for(let memId of Object.keys(doc.annotations||{})){
    bookings[memId].annotation = doc.annotations[memId];
  }
  // if (doc._id==='W2016-12-17')console.log('reformatWalkDoc:doc', prettyFormat(doc))
  // if (doc._id==='W2016-12-17')console.log('reformatWalkDoc:bookings', prettyFormat(bookings.M825))
  // console.log('bookings',bookings)
  delete doc.log;
  delete doc.booked;
  delete doc.annotations;
  doc.bookings = bookings;
  return doc;

}
