// import Logit from 'logit';
// var logit = Logit('color:white; background:black;', 'mobx:WalksStore');
var prettyFormat = require('pretty-format')
var PouchDB  = require('pouchdb');
// var db = new PouchDB('http://aidan:admin@localhost:5984/bookings', {});

(async function() {
  try {
    var db = new PouchDB('http://nicholware.com:5984/bookings', {});
    // var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});

    let docM = await db.get('M2043')
    let docA = await db.get('A2043')
    let newM = {...docM};
    let newA = {...docA};
    newM._id = "M839";
    newM.memberId = "M839";
    newM.account = "A839";
    newM.accountId = "A839";
    delete newM._rev;
    delete newA._rev;
    newA._id = "A839";
    newA.members = ["M839"]
    console.log(prettyFormat(newM));
    console.log(prettyFormat(newA));
    await db.put(newM);
    await db.put(newA);
    docM._deleted = true;
    await db.put(docM)
    docA._deleted = true;
    await db.put(docA)
  } catch (e) {
    console.error('error', e);
  }
  console.log("Yey, done!");
}());
