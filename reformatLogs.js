var prettyFormat = require('pretty-format')
var PouchDB  = require('pouchdb');
import fs from 'fs'
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});
var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});

(async function() {
  try {
    await db.destroy();
    db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    await db.compact();
    var data = fs.readFileSync('./backup/2017-01-03prod.json')
    var docs =JSON.parse(data);
    console.log(docs.length)
    docs.forEach((doc, i)=>{
      // console.log(i, doc.type, docs.length)
      if (doc.type==='walk')docs[i] = reformatWalkDoc(doc)
      if (doc.type==='account')docs[i] = reformatAccDoc(doc)
    })
    // console.log(docs)
    await db.bulkDocs(docs)

  } catch (e) {
    console.error('error', e);
  } finally {

  }

  // await loadWalks();
  // await loadAccs();
  console.log("Yey, story successfully loaded!");
}());

// async function loadMembers(){
//   try {
//     let data = await db.allDocs({ startkey: "M0000", endkey: "W9999", include_docs: true });
//
//     let docs = data.rows
//           .filter(row => row.doc.type === 'walk')
//           .map(row => {
//             if (!row.doc.booked)row.doc.booked = {};
//             if (!row.doc.annotations)row.doc.annotations = {};
//             let newDoc = reformatWalkDoc(row.doc)
//             return newDoc})
//
//     // console.log(docs)
//     await db.bulkDocs(docs)
//   } catch (e) {
//     console.error('error', e);
//   }
// }

async function loadWalks(){
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


async function loadAccs(){
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
    let [dat, who, walkId, memId, req, amount, note] = log;
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
