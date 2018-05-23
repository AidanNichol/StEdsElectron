const R = require('ramda');
// const _ = require( 'lodash');
const db = require('services/bookingsDB');
const XDate = require('xdate');
const { replicationDbChange } = require('ducks/replication-mobx');
const { merge } = require('lodash');
// const { resolveConflicts } = require( 'ducks/settings-duck');

const { logger } = require('services/logger.js');
const Logit = require('factories/logit.js');
var logit = Logit(__filename);
// var logit2 = logit;
const { observable, computed, action, autorun, toJS } = require('mobx');
const Booking = require('mobx/Booking');
const MS = require('mobx/MembersStore');
const AS = require('mobx/AccountsStore');
// import {state as signinState} from 'ducks/signin-mobx'
// logit2('signinState', signin, signinState, SigninState);
const memberName = memId => (MS.members.get(memId) || {}).fullName;
const accountName = accId => (AS.accounts.get(accId) || {}).name;
module.exports = class Walk {
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
    this.logger = logger.child({ walk: this.walkId, venue: this.venue });
    this.logger.addSerializers({
      memId: memId => `${memId} - ${memberName(memId)}`,
      accId: accId => `${accId} - ${accountName(accId)}`,
    });
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
};
// const getRev = rev => parseInt(rev.split('-')[0]);
var coll = new Intl.Collator();
// var logCmpDate = (a, b) => coll.compare(a[0], b[0]);
var datCmp = (a, b) => coll.compare(a.dat, b.dat);
var nameCmp = (a, b) => coll.compare(a.name, b.name);
// var datColl = new Intl.Collator();
