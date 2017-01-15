import R from 'ramda';
import {merge} from 'lodash'
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:Walk');
import { observable, computed, action, asMap, autorun} from 'mobx';
import {Booking} from 'mobx/Booking'

export default class Walk {
   _id =  0;
   type='walk'
  @observable _conflicts
  @observable annotations
  @observable bookings = asMap({})
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
    Object.entries(walk.bookings || {}).forEach(([memId, booking])=>this.bookings.set(memId, new Booking(booking, memId, {getWalk: this.getWalk})))
    delete walk.logs;
    merge(this, walk)

  }

  getWalk = ()=>{
    const {fee, venue, _id} = this;
    return {fee, venue, _id};
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

  @computed get report() {
		return `Walk: ${this._id} ${this.venue}`;
	}

  @action getConflictingDocs() {
		return `Walk: ${this._id} ${this.venue}`;
	}

  @action updateDocument = walk=>{
    let changed = false;
    merge(this, walk);
    return changed;
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
var logColl = new Intl.Collator();
var logCmpDate = (a, b) => logColl.compare(a[0], b[0]);
// var cmpDate = (a, b) => logColl.compare(a.dat, b.dat);
