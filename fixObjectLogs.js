var PouchDB  = require('pouchdb');
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});
var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});

(async function() {

  // await loadWalks();
  await loadAccs();
  console.log("Yey, story successfully loaded!");
}());




async function loadAccs(){
  try {
    let data = await db.allDocs({ startkey: "A0000", endkey: "A9999", include_docs: true });

    let docs = data.rows
          .filter(row => row.doc.type === 'account')
          .filter(row => typeof row.doc.logs === 'object')
          .map(row => {
            row.doc.logs = Object.values(row.doc.logs);
            return row.doc;
          }
        )

    console.log(docs)
    await db.bulkDocs(docs)
  } catch (e) {
    console.error('error', e);
  }
}
