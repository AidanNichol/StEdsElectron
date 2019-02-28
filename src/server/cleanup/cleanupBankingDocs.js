// var PouchDB = require('pouchdb');
// var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
let db = require('bookingsDB')(false);
console.log('here');

async function doit() {
  console.log('and');
  // await loadWalks();
  try {
    let info;
    info = await db.info();
    console.log(info.sizes);

    let data = await db.allDocs({
      startkey: 'BP0000',
      endkey: 'BP9999',
      include_docs: true,
    });
    console.log('there');

    let docs = data.rows.map(row => {
      const doc = row.doc;
      Object.entries(doc).forEach(([key, value]) => {
        if (typeof value === 'object') delete doc[key];
      });
      if (doc._id < 'BP2018') doc._deleted = true;
      return doc;
    });
    console.log(docs);
    await db.bulkDocs(docs);
    await db.compact();
    info = await db.info();
    console.log(info.sizes);
  } catch (e) {
    console.error('error', e);
  }
  console.log('Yey, got to the end!');
}
doit();

async function loadAccs() {}
