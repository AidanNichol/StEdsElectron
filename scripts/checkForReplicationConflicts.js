// var prettyFormat = require('pretty-format')
var PouchDB  = require('pouchdb');
var livedb = new PouchDB('http://nicholware.com:5984/bookings', {});

(async function() {
  try {
    console.log('reading live')
    var data = await livedb.allDocs({startkey: "W2016-11-01", endkey: "W2017-02-31", include_docs: true, conflicts: true})
    // console.log(data)
    var rows =data.rows;
    for(let row of rows){
      // console.log('row:',row)
      let doc = row.doc
      if (doc._conflicts)console.log(`${doc._id} ${doc._rev}`, doc._conflicts)
    }

    // console.log(docs)
    // await db.bulkDocs(docs)
    // await db.bulkDocs(docs, {new_edits: false})

  } catch (e) {
    console.error('error', e);
  } finally {

  }

  // await loadWalks();
  // await loadAccs();
  console.log("Yey, story successfully loaded!");
}());
