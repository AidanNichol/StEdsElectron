var prettyFormat = require('pretty-format')
var PouchDB  = require('pouchdb')
.plugin(require('pouchdb-adapter-websql'))
// var PouchDB  = require('pouchdb-core')
var db = new PouchDB('bookingsdev', {adapter: 'websql'});
(async function() {
  try {
    let data = await db.allDocs({ startkey: "W0000", endkey: "A9999", include_docs: true });
    console.log(prettyFormat(data))
    // await db.destroy();
    // db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
    // await db.compact();
    // var data = fs.readFileSync('./backup/2016-12-09prod.json')
    // var docs =JSON.parse(data);
    // console.log(docs.length)
    // docs.forEach((doc, i)=>{
    //   if (!doc.type)console.log(doc)
    //   // console.log(i, doc.type, docs.length)
    //   if (doc.type==='walk')docs[i] = reformatWalkDoc(doc)
    //   if (doc.type==='account')docs[i] = reformatAccDoc(doc)
    // })
    // // console.log(docs)
    // await db.bulkDocs(docs)

  } catch (e) {
    console.error('error', e);
  } finally {

  }

  // await loadWalks();
  // await loadAccs();
  console.log("Yey, story successfully loaded!");
}());
