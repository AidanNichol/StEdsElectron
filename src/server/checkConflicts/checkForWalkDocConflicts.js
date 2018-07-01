#!/usr/bin/env node
const _ = require('lodash');
const XDate = require('xdate');
const debug = require('debug');
var fs = require('fs');
var path = require('path');
let { mailgunConf } = require(path.resolve(process.cwd(), './config.js'));

// debug.enable('*, -pouchdb*');
var logit = debug('conflicts');
logit.log = console.log.bind(console);
logit.debug = console.debug.bind(console);
console.log('logit enabled:', logit.enabled);
var bunyan = require('bunyan');
logit.debug('debug');
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

let argv = require('minimist')(process.argv.slice(2), {
  boolean: ['remote', 'mail', 'fix', 'cleanup', 'verbose', 'mailall', 'prod', 'test'],
  // default: { fix: false, remote: false, mail: false, cleanup: false },
  unknown: arg => {
    console.log('unknown option: ', arg);
    return false;
  },
});
argv.setopts = function(str, val) {
  let self = this;
  str.split(/ +/).forEach(item => {
    self[item] = val;
  });
  return self;
};
argv.set = function(str) {
  return this.setopts(str, true);
};
argv.unset = function(str) {
  return this.setopts(str, false);
};
if (argv.prod) argv.set('mailall remote').unset('prod');
if (argv.test) argv.unset('remote test mail mailall').set('verbose');
if (argv.cleanup) argv.unset('mail fix verbose').set('verbose');
if (argv.mailall) argv.set('mail');
argv.local = !argv.remote;
const argvOn = Object.keys(argv)
  .reduce((res, key) => (argv[key] === true ? [...res, key] : res), [])
  .join(', ');
console.log('argv', argvOn, argv);

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
  get now() {
    return new XDate().toString('dd MMM HH:mm:ss');
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

var PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-http'))
  .plugin(require('pouchdb-authentication'));

try {
  var db;
  if (argv.remote) db = new PouchDB('http://nicholware.com:5984/bookings', {});
  else db = new PouchDB('http://aidan:admin@localhost:5984/devbookings', {});
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
      // startkey: 'W0000000',
      startkey,
      endkey,
      // startkey: 'W2017-05-20',
      // endkey: 'W2017-06-17',
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
        let walkDifferences = '';
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
          const conflictDiffs = getDifferncesInConflict(doc, conf);
          if (conflictDiffs !== '') walkDifferences += conflictDiffs;

          // logit('\n', confDocDifferences);
        });
        if (walkDifferences) {
          if (doc._fixed && argv.fix) {
            delete doc._fixed;
            await db.put(doc);
          }
          // logit('walk walkDifferences', '\n', walkDifferences);
          allDifferences +=
            `\n<h2>${doc.walkId.substr(1)} ${doc.venue}</h2>` + walkDifferences;
          // await this.dbUpdate();
        }
        if (!walkDifferences && argv.verbose && argv.cleanup && doc.closed)
          await deleteConflictingDocs(doc);
      } catch (error) {
        console.warn(error);
      }
    }
    fs.writeFileSync('output.html', allDifferences || 'No differences detected');
    // console.log(
    //   'allDifferences',
    //   '\n=========mailout=======\n\n',

    //   allDifferences,
    // );
    const notifier = require('node-notifier');
    // String

    // Object
    notifier.notify({
      title: 'Replication Conficts - ' + argvOn,
      message: DS.now + (allDifferences ? '  *** Changes!!' : '  all OK'),
    });
    sendEmail(allDifferences);
    console.log('finished');
  } catch (error) {
    console.error(error);
  }
}

function getDifferncesInConflict(doc, conflictDoc) {
  var diffs = '';
  Object.entries(conflictDoc.bookings).forEach(([memId, cBooking]) => {
    let booking = doc.bookings[memId];
    const versId = conflictDoc._rev.substr(0, 10) + '...';
    const mLogs = mergeLogs((booking || {}).logs, cBooking.logs);
    if (!mLogs) return;
    let diff = '';
    const src = v => (v ? '&#x2714;' : '-');
    let aRes = false;
    let bRes = false;
    let mismatch = false;
    for (let i = mLogs.length - 1; i >= 0; i--) {
      const log = mLogs[i];
      log.color = 'black';
      if (log.req === 'A') {
        if (!aRes) {
          if (log.src[1] && log.note !== (booking || {}).annotation) {
            log.color = 'red';
            mismatch = true;
            aRes = true;
            if (argv.fix) {
              booking.annotate = log.note;
              booking.logs.push[log];
              doc._fixed = true;
            }
            continue;
          }
          if (log.src[0] && log.note === (booking || {}).annotation) {
            log.color = 'green';
            aRes = true;
            continue;
          }
        }
      } else {
        if (!bRes) {
          if (log.src[1] && log.req !== (booking || {}).status) {
            log.color = 'red';
            mismatch = true;
            bRes = true;
            if (argv.fix) {
              if (booking) {
                booking.logs = [...booking.logs, log];
                booking.status = log.req;
              } else doc.bookings[memId] = cBooking;
              doc._fixed = true;
            }
            continue;
          }
          if (log.src[0] && log.req === (booking || {}).status) {
            log.color = 'green';
            bRes = true;
            continue;
          }
        }
      }
    }
    // const imgstyle = req => {
    //   return `background: url(http://new.stedwardsfellwalkers.co.uk/images/icon-${req}.png);display: inline-block; width: 32px; height: 32px;`;
    // };

    if (!argv.verbose && !mismatch) return;
    mLogs.forEach(log => {
      if (log.color !== 'black') log.color += ';font-weight:bold';
      diff += `\n<tr style="color:${log.color}">
      <td>${src(log.src[0])}</td>
      <td>${src(log.src[1])}</td>
      <td>
      <img src="http://new.stedwardsfellwalkers.co.uk/images/icon-${log.req}.png" 
      width="32" height="32" alt="${log.req === 'B' ? log.req : ''}"/></td>
      <td>${log.req === 'A' ? log.note : '&nbsp;'}</td>
      <td>${DS.dispDate(log.dat)}</td>
      <td>${!log.src[0] ? versId : '&nbsp;'}</td>
      </tr>
      `;
    });
    diffs = `<h3 style="margin-left: 15px">${memId} ${memNames[memId]}</h3>
    <table style="margin-left:45px;">
    <thead><tr><td>Curr</td><td>Conf</td><td colspan=2>Field</td><td>When</td><td>Conf Id</td></tr></thead>
    ${diff}</table></h4>`;
  });
  return diffs;
}

function mergeLogs(curLogs, confLogs) {
  const defLog = { dat: '9999-99-99' };
  let cLogs = curLogs ? [...curLogs].sort(datCmp) : [];
  // let lastLog = currLogRecs.pop() || { dat: '' };
  let xLogs = confLogs ? [...confLogs].sort(datCmp) : [];
  let mLogs = [];
  let cLog = cLogs.shift() || defLog;
  let xLog = xLogs.shift() || defLog;
  let mismatch = false;
  while (cLog.req || xLog.req) {
    if (cLog.dat === xLog.dat) {
      mLogs.push({ ...cLog, src: [true, true] });
      cLog = cLogs.shift() || defLog;
      xLog = xLogs.shift() || defLog;
    } else if (cLog.dat < xLog.dat) {
      mLogs.push({ ...cLog, src: [true, false] });
      cLog = cLogs.shift() || defLog;
      mismatch = true;
    } else {
      mLogs.push({ ...xLog, src: [false, true] });
      xLog = xLogs.shift() || defLog;
      mismatch = true;
    }
    if (!mismatch && !xLog.req) return undefined;
  }
  // if (mismatch) {
  //   logit('mregedLogs', mLogs, curLogs, confLogs);
  // }
  return mismatch ? mLogs : undefined;
}
async function deleteConflictingDocs(doc) {
  let docs = doc._conflicts.map(rev => {
    return { _id: doc._id, _rev: rev, _deleted: true };
  });
  let res = await db.bulkDocs(docs);
  logit('deleteConflicts', docs, doc._conflicts, res);
  doc._conflicts = [];
}
function sendEmail(body) {
  if (!argv.mail || !body) return;
  var mailgun = require('mailgun-js')(mailgunConf);
  var html = `<html>No problems detected</html>`;
  if (body !== '') {
    let msg = '';
    if (argv.verbose)
      msg += `<p>This is the result of running the conflict detection program in verbose mode.
      It shows all entries that differ between the current documents and those in the conflicting document.
      <br/>Any item with an entry highlighted in green are deemed to be correct in the current document.`;
    else msg += `Some missed changes have been detected in replication conflicts.`;
    msg += `<br/>Any item with an entry hightlighted in red have more recent data in the conflicting document.</p>`;
    if (argv.fix)
      msg += `<p>These errors have been automatically correct 
        and the the current system should now incorporate the relevant changes. 
        Action only needs to be taken if you feel that correction was not appropriate.</p>`;
    else
      msg += `<p>Any missed changes (in red) need to be applied again in order to fix the problem. 
        They will continue to be reported if the are not fix.</p>`;

    html = `<html>${msg}   <br/><br/> Aidan ${body}</html>`;
  }
  var data = {
    from: 'Aidan Nichol <aidan@mg.nicholware.co.uk>',
    // to: 'bookings@stedwardsfellwalker.co.uk',
    // cc: 'aidan@nicholware.co.uk',
    // to: 'aidan@nicholware.co.uk',
    to: 'aidan@nicholware.co.uk',
    subject: 'Replication Conflicts @ ' + DS.now,
    text: 'Significant replication conflicts detected - action required!',
    html: html,
  };
  if (argv.mailall) {
    data.to = 'bookings@stedwardsfellwalkers.co.uk';
    data.cc = 'aidan@nicholware.co.uk';
  }

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
