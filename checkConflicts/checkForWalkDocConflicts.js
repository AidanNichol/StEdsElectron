#!/usr/bin/env node
const _ = require('lodash');
const XDate = require('xdate');
const debug = require('debug');
// var fs = require('fs');
var path = require('path');
let { mailgunConf } = require(path.resolve(process.cwd(), './config.js'));

var logit = require('debug')(__filename);
debug.enable('*, -pouchdb*');
var bunyan = require('bunyan');

function logToConsole() {}

logToConsole.prototype.write = function(rec) {
  let { msg, name, hostname, level, v, time, pid, ...obj } = rec; // eslint-disable-line no-unused-vars
  console.log(msg, obj);
};

var logger = bunyan.createLogger({
  name: 'bookings', // Required

  streams: [
    {
      type: 'raw',
      stream: new logToConsole(),
    },
  ],
  src: false, // Optional, see "src" section
});

// const dateDisplay = dat => new XDate(dat).toString('dd MMM HH:mm');

class DateStore {
  constructor(today) {
    if (today) {
      this.today = new XDate(today);
    } else {
      this.today = new XDate();
    }
    console.log(this);
  }

  dispDate(dat) {
    return new XDate(dat).toString('dd MMM HH:mm');
  }

  get todaysDate() {
    return this.today.toString('yyyy-MM-dd');
  }

  get lastAvailableDate() {
    return this.today
      .clone()
      .addDays(59)
      .toString('yyyy-MM-dd');
  }

  get nowMinus3Weeks() {
    return this.today
      .clone()
      .addWeeks(-4)
      .toString('yyyy-MM-dd');
  }
}

const DS = new DateStore();

var PouchDB = require('pouchdb-core').plugin(require('pouchdb-adapter-http'));
PouchDB.plugin(require('pouchdb-authentication'));

try {
  // var db = new PouchDB('http://nicholware.com:5984/bookings', {});
  var db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
  init();
} catch (error) {
  logit(error);
}
// wlogger.addSerializers({
//   memId: memId => `${memId} - ${memberName(memId)}`,
//   accId: accId => `${accId} - ${accountName(accId)}`,
// });
var wlogger = logger;
const memNames = {};
async function init() {
  // const data = await db.allDocs({include_docs: true, conflicts: true, startkey: 'W', endkey: 'W9999999' });
  try {
    const mdata = await db.allDocs({
      include_docs: true,
      startkey: 'M000000',
      endkey: 'M999999',
    });
    mdata.rows.map(row => row.doc).forEach(doc => {
      memNames[doc._id] = `${doc.firstName} ${doc.lastName}`;
    });
    const endkey = 'W' + DS.lastAvailableDate;
    const startkey = 'W' + DS.nowMinus3Weeks;
    logit('loadWalks', startkey, '<-->', endkey);
    const data = await db.allDocs({
      include_docs: true,
      conflicts: true,
      startkey: 'W0000000',
      // startkey,
      endkey,
    });
    let allDifferences = '';
    logit('walks', data);
    for (let row of data.rows.sort(idCmp)) {
      try {
        const doc = row.doc;
        wlogger = logger.child({ walk: doc.walkId, venue: doc.venue });
        if (_.isEmpty(doc._conflicts)) continue;
        // if (doc.closed) continue;
        logit('conflicts', doc._id, doc._rev, doc.venue, doc._conflicts);

        let confs = await db.get(doc._id, {
          open_revs: doc._conflicts,
          include_docs: true,
        });
        confs = confs.map(row => row.ok);
        // const confRevs = confs.map(conf => conf._rev);
        // wlogger.info({ curRev: doc._rev, confRevs, confs }, 'conflicting docs');
        // doc.conflicts = confs.map(row => row.ok);
        let walkDifferences = false;
        confs.forEach(conf => {
          wlogger = logger.child({
            confRev: conf._rev,
            walk: doc.walkId,
            venue: doc.venue,
          });
          if (!conf.bookings) {
            wlogger.info('skipping oldformat');
            return;
          }
          wlogger.info('starting resolving conflict Doc');
          const confDocDifferences = findSignificantChangesInTheConflictingDoc(doc, conf);
          walkDifferences = mergeWalkDifferences(
            doc,
            walkDifferences,
            confDocDifferences,
          );
          logit(
            'finished resolving conflict doc',
            '\n',
            walkDifferences,
            '\n',
            confDocDifferences,
          );
        });
        if (walkDifferences) {
          logit('walk walkDifferences', '\n', walkDifferences);
          allDifferences += walkDifferences;
          // await this.dbUpdate();
        }
        // await deleteConflictingDocs(doc._conflicts);
      } catch (error) {
        console.warn(error);
      }
    }
    logit(
      'allDifferences',
      '\n=========mailout=======\n\n',

      allDifferences,
    );
    sendEmail(allDifferences);
    console.log('finished');
  } catch (error) {
    console.error(error);
  }
}
function mergeWalkDifferences(doc, diffs, docDiff) {
  if (!docDiff) return diffs;
  if (!diffs) {
    diffs = `\n<h2>${doc.walkId.substr(1)} ${doc.venue}</h2>`;
  }
  diffs += docDiff;
  logit('mergeDiffernces', diffs, docDiff);
  return diffs;
}
// async function deleteConflictingDocs(conflicts) {
//   let docs = conflicts.map(rev => {
//     return { _id: this._id, _rev: rev, _deleted: true };
//   });
//   let res = await db.bulkDocs(docs);
//   logit('deleteConflicts', this, docs, conflicts, res);
//   this._conflicts = [];
// }

function findSignificantChangesInTheConflictingDoc(doc, conflictDoc) {
  let docChanged = false;
  var diffs = '';
  Object.entries(conflictDoc.bookings).forEach(([memId, cBooking]) => {
    let booking = doc.bookings[memId];
    const versId = () => conflictDoc._rev.substr(0, 10) + '...';
    const accumulateBookingDiffences = change => {
      if (!change) return;
      logit('change accum', change);
      diffs += `\n<p>${memId} <b>${memNames[memId]}</b>
         - Request: <b>${change.request}</b> 
         Currently: <b>${change.curr}</b>   
         (at: ${DS.dispDate(change.at)} cDoc: ${versId()})</p>`;
    };
    if (booking) {
      if (booking.annotation !== cBooking.annotation && cBooking.annotation) {
        logit('annotation difference', {
          memId,
          current: booking.annotation,
          conflict: cBooking.annotation,
        });
        docChanged = resolveAnnotationConflict(booking, cBooking.logs);
        accumulateBookingDiffences(docChanged);
      }
      if (booking.status !== cBooking.status) {
        docChanged = resolveWalkStatusConflict(booking, cBooking.logs);
        accumulateBookingDiffences(docChanged);
      }
    } else {
      const change = {
        request: cBooking.status,
        curr: 'unbooked',
        at: cBooking.logs.pop().dat,
      };
      wlogger.warn(cBooking, 'added booking from conflict');
      accumulateBookingDiffences(change);
    }
  });

  return diffs;
}

function resolveAnnotationConflict(booking, confLogs) {
  const latestLog = getLatestLog(booking.logs, confLogs, log => log.req === 'A');
  if (!latestLog) return false;
  // conflcting document has a newer change
  const newNote = latestLog.note;
  const change = { request: newNote, curr: booking.note, at: latestLog.dat };
  booking.note = newNote;

  wlogger.warn(change, 'updated annotation');
  return change;
}
function resolveWalkStatusConflict(booking, confLogs) {
  const latestLog = getLatestLog(booking.logs, confLogs, log => log.req !== 'A');

  if (!latestLog) return false;

  const change = { request: latestLog.req, curr: booking.status, at: latestLog.dat };

  booking.status = latestLog.req;
  wlogger.warn(change, 'updated status from conflicts');
  return change;
}
function getLatestLog(curLogs, confLogs, filterFn) {
  let currLogRecs = curLogs.filter(filterFn).sort(datCmp);
  let lastLog = currLogRecs.pop() || { dat: '' };
  let extraLogRecs = confLogs
    .filter(filterFn)
    .filter(log => log.dat > lastLog.dat)
    .sort(datCmp);
  return extraLogRecs.length === 0 ? false : extraLogRecs.pop();
}

function sendEmail(body) {
  var mailgun = require('mailgun-js')(mailgunConf);
  var html =
    body === ''
      ? `<html>No problems detected</html>`
      : `<html>Some missed changes have been detected in replication conflicts. 
    Reapplying any of these changes should fix the problem and stop the reporting of the error.
    <br/><br/>
    Aidan
    ${body}</html>`;

  var data = {
    from: 'Aidan Nichol <aidan@mg.nicholware.co.uk>',
    // to: 'bookings@stedwardsfellwalker.co.uk',
    // cc: 'aidan@nicholware.co.uk',
    to: 'aidan@nicholware.co.uk',
    subject: 'Replication Conflicts',
    text: 'Significant replication conflicts detected - action required!',
    html: html,
  };

  mailgun.messages().send(data, function(error, body) {
    console.log(body);
  });
}
// const getRev = rev => parseInt(rev.split('-')[0]);
var coll = new Intl.Collator();
// var logCmpDate = (a, b) => coll.compare(a[0], b[0]);
var datCmp = (a, b) => coll.compare(a.dat, b.dat);
var idCmp = (a, b) => coll.compare(a.id, b.id);
// var datColl = new Intl.Collator();
