import R from 'ramda';
import db from 'services/bookingsDB';
import XDate from 'xdate';
import {replicationDbChange} from 'ducks/replication-mobx';
import {merge} from 'lodash'
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:Walk');
import { observable, computed, action, autorun, toJS} from 'mobx';
import {Booking} from 'mobx/Booking'
import MS, {lastnameCmp} from 'mobx/MembersStore'

export default class Walk {
   _id =  0;
   type='walk'
  @observable _conflicts
  @observable annotations
  bookings = observable.map({})
  @observable capacity
  @observable closed = false;
  @observable fee
  @observable firstBooking
  @observable lastCancel
  @observable venue
  walkDate
  walkId


  constructor(walk) {
    autorun(() => logit('autorun', this.report, this));
    // Object.entries(walk.bookings || {}).forEach(([memId, booking])=>this.bookings.set(memId, new Booking(booking, memId, {getWalk: this.getWalk})))
    // delete walk.logs;
    // merge(this, walk)
    this.updateDocument(walk)

  }

  getWalk = ()=>{
    const {fee, venue, _id} = this;
    return {fee, venue, _id};
  }

  @computed get dispDate(){
    return new XDate(this.walkDate).toString('dd MMM');
  }

  @computed get walkDate(){return this._id.substr(1)}
  @computed get shortname(){return this.venue.split(/[ -]/, 2)[0]}

  @computed get code(){
    let code = this.shortname[0]+this.shortname.substr(1).replace(/[aeiou]/ig, '');
    if (code.length > 4)code = code.substr(0,2)+code.substr(-2);
    return code;
  }

  @computed get names(){
    return {venue: this.venue, shortname: this.shortname, code: this.code};
  }

  @computed get bookingTotals(){
    let totals = {B:0, W:0}
    this.bookings.values().map(({status})=>{
      /^[BW]$/.test(status) && totals[status]++;
    })
    let free = this.capacity - totals.B;
    let display = ''+free + (totals.W > 0 ? ` (-${totals.W})` : '');
    return {booked: totals.B, waitlist: totals.W, free, available:free-totals.W, full: free < totals.W, display};
  }

  @computed get walkLogsByMembers() {
    let map = {};
    // let activeMember = MS.activeMember;
    for(let [memId, booking] of this.bookings.entries()){
      map[memId] = booking.mergeableLogs;
    }

    // logit(`walkLogsByMembers ${this._id}`, map);
    // logit(`getWalkLog ${this._id} ${activeMember}`, map[activeMember]);
    return map;
  }

  @computed get busBookings() {return this.getBookings('B')}
  @computed get carBookings() {return this.getBookings('C')}
  getBookings = (requestType)=> {
    logit('makeGetBookings', this.bookings, requestType)
    let bookings = this.bookings.values()
      .filter(booking => booking.status === requestType)
      .map((booking)=>{
        const memId = booking.memId
        let member = MS.members.get(memId);
        let name = member.fullNameR;
        //  let name = members[memId].firstName+' '+members[memId].lastName;
        let annotation = (booking.annotation ? ` (${booking.annotation})` : '')
        if (member.memberStatus === 'Guest')annotation += ' *G*';
        return { memId, name, annotation, type: booking.status, requestType};
      })
      .sort(nameCmp);
    logit('getBookings', bookings);
    return bookings;
  }

  @computed get waitingList() {
    let bookings = this.bookings.values()
    .filter(booking=>booking.status === 'W')
    .map(booking=>{
      const memId = booking.memId;
      let member = MS.members.get(memId);
      let name = member.fullNameR;
      let dat = booking.logs.values().reverse()[0].dat;
      return {dat, memId, name, waitlisted: true};
    });

    return bookings.sort(datCmp);
  }


  @action annotateBooking(memId, note){
    logit('annotateBooking', memId, note)

    var booking = this.bookings.get(memId);
    booking && booking.updateAnnotation(note)
    this.dbUpdate();
  }

  @action updateBookingRequest(memId, req){

    var booking = this.bookings.get(memId);
    logit('updateBookingRequest', booking, memId, req)
    if (!booking){
      booking = new Booking({}, memId, {getWalk: this.getWalk} );
      this.bookings.set(memId, booking);
    }
    booking.updateBookingRequest(req);
    logit('updated booking', booking);
    if (booking.deleteMe)this.bookings.delete(memId);
    this.dbUpdate();
  }

  @action resetLateCancellation(memId){
    logit('resetLateCancellation', memId)
    var booking = this.bookings.get(memId) || {};
    if (booking.status !== 'BL') return false;
    booking.resetLateCancellation();
    this.dbUpdate();
    return;
  }

  @action closeWalk(){
    this.closed = true;
    this.dbUpdate();
  }



  @computed get report() {
		return `Walk: ${this._id} ${this.venue}`;
	}

  @action getConflictingDocs() {
		return `Walk: ${this._id} ${this.venue}`;
	}

  @action dbUpdate = async ()=>{
    logit('DB Update start', this)
    let {_conflicts, ...newDoc} = toJS(this);
    Object.entries(newDoc.bookings).map(([memId, booking])=>{
      logit('whoops', this._id, this.venue, memId, booking)
      newDoc.bookings[memId].logs = Object.values(booking.logs)
    });

    // newDoc.logs = Object.values(newDoc.logs)
    logit('DB Update', newDoc, _conflicts, this)
    const res = await db.put(newDoc);
    this._rev =  res.rev;
    const info = await db.info();
    logit('info', info);
    replicationDbChange(info);
  }

  @action updateDocument = walkDoc=>{
      // const added = R.difference(Object.keys(walkDoc.bookings), this.bookings.keys());
    Object.entries(walkDoc.bookings || {}).forEach(([memId, booking])=>{
      if (this.bookings.has(memId))this.bookings.get(memId).updateBookingFromDoc(booking)
      else this.bookings.set(memId, new Booking(booking, memId, {getWalk: this.getWalk}));
    })
    const deleted = R.difference(this.bookings.keys(), Object.keys(walkDoc.bookings||{}));
    deleted.forEach(memId=>this.bookings.delete(memId))
    delete walkDoc.bookings;
    delete walkDoc.walkDate;
    merge(this, walkDoc)
    return;
  }

  /*-------------------------------------------------*/
  /*                                                 */
  /*         Replication Conflicts                   */
  /*                                                 */
  /*-------------------------------------------------*/
  @computed get conflictingDocVersions(){
    return R.pluck('_rev', this.conflictingDocs)
  }
  @computed get conflictingDocs(){
    return [this, ...this.conflicts.sort((a,b)=>getRev(b._rev)-getRev(a._rev))]
  }
  @computed get conflictsByMember(){
    let revs = this.conflictingDocs;
    logit('revs', revs)
    let sum = {}
    revs.forEach((rev, i)=>{
      Object.entries(rev.booked||{}).forEach(([id, value])=>{
        if (!sum[id])sum[id] = {status: R.repeat('-', revs.length), logs: {}}
        sum[id].status[i] = value;
      });
      (rev.log||[]).forEach((lg)=>{
        let [dat, , id, req] = lg;
        if (!sum[id])sum[id] = {status: R.repeat('-', revs.length), logs: {}}
        if (!sum[id].logs[dat])sum[id].logs[dat] = R.repeat('-', revs.length);
        sum[id].logs[dat][i]=req;
      })
    })
    // now filter out the OK stuff
    Object.entries(sum).forEach(([memId, data])=>{
      const status = data.status;
      data.statusOK = R.all((v)=> v===status[0], status);
      for(let [dat, data] of Object.entries(data.logs).sort(logCmpDate)){
        const dataOK = R.all((v)=> v===data[0], data);
        if (dataOK)delete sum[memId].logs[dat];
        else break;
      }
      if (Object.keys(sum[memId].logs).length === 0 && data.statusOK)delete sum[memId]
    })
    return sum;

  }

}
const getRev = (rev)=> parseInt(rev.split('-')[0]);
var coll = new Intl.Collator();
var logCmpDate = (a, b) => coll.compare(a[0], b[0]);
var datCmp = (a, b) => coll.compare(a.dat, b.dat);
var nameCmp = (a, b) => coll.compare(a.name, b.name);
// var datColl = new Intl.Collator();
