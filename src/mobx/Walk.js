import R from 'ramda';
import _ from 'lodash';
import db from 'services/bookingsDB';
import XDate from 'xdate';
import { replicationDbChange } from 'ducks/replication-mobx';
import { merge } from 'lodash';
import { resolveConflicts } from 'ducks/settings-duck';

import {logger} from 'services/logger.js';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);
console.warn(
  'logit',
  __filename,
  __filename.substr(0, __filename.length - 3) + '/conflicts',
);
var logit2 = Logit(__filename.substr(0, __filename.length - 3) + 'Conflicts');
// var logit2 = logit;
import { observable, computed, action, autorun, toJS, runInAction } from 'mobx';
import { Booking } from 'mobx/Booking';
import MS from 'mobx/MembersStore';
// import {state as signinState} from 'ducks/signin-mobx'
import { state as signin, SigninState } from 'ducks/signin-mobx.js';
import signinState from 'ducks/signin-mobx.js'
logit2('signinState', signin, signinState, SigninState)
const memberName = (memId)=>MS.members.get(memId).fullName;
export default class Walk {
  _id = 0;
  type = 'walk';
  _conflicts;
  @observable annotations;
  bookings = observable.map({});
  @observable capacity;
  @observable closed = false;
  @observable fee;
  @observable firstBooking;
  @observable lastCancel;
  @observable venue;
  walkDate;
  walkId;
  logger;
  confLogger;
  // addMemberName(memId){
  //   // let memName = MS.members.get(memId).fullName;
  //   return `${memId} - ${MS.members.get(memId).fullName}`;
  // }


  constructor(walk) {
    autorun(() => logit('autorun', this.report, this));
    // Object.entries(walk.bookings || {}).forEach(([memId, booking])=>this.bookings.set(memId, new Booking(booking, memId, {getWalk: this.getWalk})))
    // delete walk.logs;
    // merge(this, walk)
    this.updateDocument(walk);
    this.logger = logger.child({walk: this.walkId, venue: this.venue});
    this.logger.addSerializers({memId: (memId)=>`${memId} - ${memberName(memId)}`});
  }

  getWalk = () => {
    const { fee, lastCancel, venue, _id, logger } = this;
    return { fee, lastCancel, venue, _id, logger };
  };

  @computed
  get dispDate() {
    return new XDate(this.walkDate).toString('dd MMM');
  }

  @computed
  get walkDate() {
    return this._id.substr(1);
  }
  @computed
  get shortname() {
    return this.venue.split(/[ -]/, 2)[0];
  }

  @computed
  get code() {
    if (this.shortCode) return this.shortCode;
    let code = this.shortname[0] + this.shortname.substr(1).replace(/[aeiou]/gi, '');
    if (code.length > 4) code = code.substr(0, 2) + code.substr(-2);
    return code;
  }

  @computed
  get names() {
    return { venue: this.venue, shortname: this.shortname, code: this.code };
  }

  @computed
  get bookingTotals() {
    let totals = { B: 0, W: 0 };
    this.bookings.values().map(({ status }) => {
      /^[BW]$/.test(status) && totals[status]++;
    });
    let free = this.capacity - totals.B;
    let display = '' + free + (totals.W > 0 ? ` (-${totals.W})` : '');
    return {
      booked: totals.B,
      waitlist: totals.W,
      free,
      available: free - totals.W,
      full: free <= totals.W,
      display,
    };
  }

  @computed
  get walkLogsByMembers() {
    let map = {};
    // let activeMember = MS.activeMember;
    for (let [memId, booking] of this.bookings.entries()) {
      map[memId] = booking.mergeableLogs;
    }

    // logit(`walkLogsByMembers ${this._id}`, map);
    // logit(`getWalkLog ${this._id} ${activeMember}`, map[activeMember]);
    return map;
  }

  @computed
  get busBookings() {
    return this.getBookings('B');
  }
  @computed
  get carBookings() {
    return this.getBookings('C');
  }
  getBookings = requestType => {
    logit('makeGetBookings', this.bookings, requestType);
    let bookings = this.bookings
      .values()
      .filter(booking => booking.status === requestType)
      .map(booking => {
        const memId = booking.memId;
        let member = MS.members.get(memId);
        let name = member.fullNameR;
        //  let name = members[memId].firstName+' '+members[memId].lastName;
        let annotation = booking.annotation ? ` (${booking.annotation})` : '';
        // if (member.memberStatus === "Guest") annotation += " *G*";
        const guest = member.memberStatus === 'Guest';
        return {
          memId,
          name,
          annotation,
          type: booking.status,
          requestType,
          guest,
        };
      })
      .sort(nameCmp);
    logit('getBookings', bookings);
    return bookings;
  };

  @computed
  get waitingList() {
    let bookings = this.bookings
      .values()
      .filter(booking => booking.status === 'W')
      .map(booking => {
        const memId = booking.memId;
        let member = MS.members.get(memId);
        let name = member.fullNameR;
        let dat = booking.logs.values().reverse()[0].dat;
        return { dat, memId, name, waitlisted: true };
      });

    return bookings.sort(datCmp);
  }

  @action
  annotateBooking(memId, note) {
    logit('annotateBooking', memId, note);

    var booking = this.bookings.get(memId);
    booking && booking.updateAnnotation(note);
    this.dbUpdate();
  }

  @action
  updateBookingRequest(memId, req) {
    var booking = this.bookings.get(memId);
    logit('updateBookingRequest', booking, memId, req);
    if (!booking) {
      booking = new Booking({}, memId, {
        getWalk: this.getWalk,
        walk: this.walk,
      });
      this.bookings.set(memId, booking);
    }
    booking.updateBookingRequest(req);
    logit('updated booking', booking);
    if (booking.deleteMe) this.bookings.delete(memId);
    this.dbUpdate();
  }

  @action
  resetLateCancellation(memId) {
    logit('resetLateCancellation', memId);
    var booking = this.bookings.get(memId) || {};
    if (booking.status !== 'BL') return false;
    booking.resetLateCancellation();
    this.dbUpdate();
    return;
  }

  @action
  closeWalk() {
    this.closed = true;
    this.dbUpdate();
  }

  @computed
  get report() {
    return `Walk: ${this._id} ${this.venue}`;
  }

  @action
  getConflictingDocs() {
    return `Walk: ${this._id} ${this.venue}`;
  }

  @action
  dbUpdate = async () => {
    logit('DB Update start', this);
    let { _conflicts, ...newDoc } = toJS(this);
    Object.entries(newDoc.bookings).map(([memId, booking]) => {
      newDoc.bookings[memId].logs = Object.values(booking.logs);
    });

    // newDoc.logs = Object.values(newDoc.logs)
    logit('DB Update', newDoc, _conflicts, this);
    const res = await db.put(newDoc);
    this._rev = res.rev;
    const info = await db.info();
    logit('info', info);
    replicationDbChange('walk changed');
  };

  @action
  updateDocument = walkDoc => {
    // const added = R.difference(Object.keys(walkDoc.bookings), this.bookings.keys());
    Object.entries(walkDoc.bookings || {}).forEach(([memId, booking]) => {
      if (this.bookings.has(memId))
        this.bookings.get(memId).updateBookingFromDoc(booking);
      else
        this.bookings.set(memId, new Booking(booking, memId, { getWalk: this.getWalk }));
    });
    const deleted = R.difference(
      this.bookings.keys(),
      Object.keys(walkDoc.bookings || {}),
    );
    deleted.forEach(memId => this.bookings.delete(memId));
    delete walkDoc.bookings;
    delete walkDoc.walkDate;
    merge(this, walkDoc);
    return;
  };

  /*-------------------------------------------------*/
  /*                                                 */
  /*         Replication Conflicts                   */
  /*                                                 */
  /*-------------------------------------------------*/
  // @computed
  // get conflictingDocVersions() {
  //   return R.pluck('_rev', this.conflictingDocs);
  // }
  // @computed
  // get conflictingDocs() {
  //   return [
  //     this,
  //     ...this.conflicts.sort((a, b) => getRev(b._rev) - getRev(a._rev))
  //   ];
  // }
  @action
  async resolveConflicts() {
    if (_.isEmpty(this._conflicts)) return;
    logit2('conflicts', this._id, this._rev, this.venue, this._conflicts);
    if (!resolveConflicts) {
      logit2('skipping - not admin')
      return;
    }
    let confs = await db.get(this._id, {
      open_revs: this._conflicts,
      include_docs: true,
    });
    confs = confs.map(row=>row.ok);
    const confRevs = confs.map(conf=>conf._rev)
    this.logger.info({curRev: this._rev, confRevs, confs}, 'conflicting docs');
    runInAction('addConflicting docs', () => {
      // this.conflicts = confs.map(row => row.ok);
      let changed = false;
      confs.forEach(conf => {
        this.confLogger = this.logger.child({confRev: conf._rev})
        this.confLogger.addSerializers({msg: (msg)=>'Conflicting Doc '+msg})
        if (!conf.bookings) {
          this.confLogger.info('skipping oldformat')
          return;
        }
        this.confLogger.info('starting resolving conflict Doc');
        changed = this.updateWithConflictDoc(conf) || changed;
        this.confLogger.info({changed}, 'finished resolving conflict doc')
        // this.insertPaymentsFromConflictingDoc(added);
      });
      if (changed) {
        this.confLogger.info('walk updated from conflicts')
        this.dbUpdate();
      }
     
      this.deleteConflictingDocs(this._conflicts);
    });
  }
  @action
  async deleteConflictingDocs(conflicts) {
    let docs = conflicts.map(rev => {
      return { _id: this._id, _rev: rev, _deleted: true };
    });
    let res = await db.bulkDocs(docs);
    logit2('deleteConflicts', this, docs, conflicts, res);
    this._conflicts = [];
  }

  updateWithConflictDoc(conflictDoc) {
    let docChanged = false;
    Object.entries(conflictDoc.bookings).forEach(([memId, cBooking]) => {
      let booking = this.bookings.get(memId);
      if (booking) {
        if ( booking.annotation !== cBooking.annotation && cBooking.annotation )
          {
            logit2('annotation difference', {current: booking.annotation, conflict: cBooking.annotation})
            docChanged = booking.resetAnnotationFromConflicts(cBooking.logs) || docChanged;}
        if ( booking.status !== cBooking.status)
        {
          logit2('status difference', {current: booking.status, conflict: cBooking.status})
          docChanged = booking.resetStatusFromConflicts(cBooking.logs) || docChanged;}
      } else {
        this.bookings.set(
          memId,
          new Booking(cBooking, memId, {
            getWalk: this.getWalk,
          }),
        );
        docChanged = true;
        this.confLogger.warn(cBooking, 'added booking from conflict');
      }
    });
    return docChanged;
  }

  findChangesFromLogs(booking, cBooking) {
    if (!cBooking.logs) return;
    let inserted = false;
    for (let log of cBooking.logs) {
      let okLog = booking.logs.get(log.dat);
      if (okLog) continue; // got this one
      booking.insertLogRecFromConflicts(log);
      logit2('added log', log);
      inserted = true;
    }
    inserted && booking.resetStatusAndAnnotation();
    return inserted;
  }
}
// const getRev = rev => parseInt(rev.split('-')[0]);
var coll = new Intl.Collator();
// var logCmpDate = (a, b) => coll.compare(a[0], b[0]);
var datCmp = (a, b) => coll.compare(a.dat, b.dat);
var nameCmp = (a, b) => coll.compare(a.name, b.name);
// var datColl = new Intl.Collator();
