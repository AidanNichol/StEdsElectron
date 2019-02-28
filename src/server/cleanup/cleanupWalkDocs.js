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
      startkey: 'W000000',
      endkey: 'W999999',
      include_docs: true,
    });
    console.log('there');

    let docs = data.rows
      .map(row => {
        const doc = row.doc;
        let fixed = false;
        if (doc.logger) {
          fixed = true;
          delete doc.logger;
        }
        Object.values(doc.bookings).forEach(booking => {
          booking.logs.forEach(log => {
            if (log.walk) {
              fixed = true;
              delete log.walk;
            }
            if (log.member) {
              fixed = true;
              delete log.member;
            }
          });
        });

        return fixed ? doc : null;
      })
      .filter(item => item !== null);
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
