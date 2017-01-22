import { observable, computed, action, runInAction, reaction, toJS} from 'mobx';
import db from 'services/bookingsDB';
// import {getSettings} from 'ducks/settings-duck';
import R from 'ramda';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:WalksStore');

import MS from 'mobx/MembersStore'
import DS from 'mobx/DateStore'
import Walk from './Walk'
// import PouchDb from 'pouchdb'
class WalksStore {


  walks = observable.map({});
  @observable activeWalk;
  @observable loaded = false;

  constructor(walks) {
    this.activeWalk = null;
    if (walks)this.addWalks(walks)
    else this.loadWalks();
    reaction(()=>this.activeWalk, d=>logit('activeWalk set:', d))
  }
  bookableWalksId = ()=>{
    const today = DS.todaysDate;
    const walkIds = this.walks.values().sort(idCmp)
        .filter(walk=>today<=walk.walkDate)
        .filter(walk=>today > walk.firstBooking)
        .map(walk=>walk._id);
    logit('bookableWalksId', walkIds)
    return walkIds;
  }

  @computed get conflictingWalks() {
    return this.walks.values().filter((entry)=>entry._conflicts.length>0)
  }

  @computed get allWalkLogsByAccount(){
    // logit('allWalkLogsByAccount',this)
    let map = {}
    this.walks.values().forEach(walk=>{
      // logit('allWalkLogsByAccount:walk', walk._id, walk.venue, walk.walkLogsByMembers)
      Object.entries(walk.walkLogsByMembers).map(([memId, logs])=>{
        let member = MS.members.get(memId)
        let accId = member.accountId;
        if (!map[accId])map[accId] = logs;
        else map[accId] = R.concat(map[accId], logs)
      })
      // logit('allWalkLogsByAccount:walk', walk._id, walk.venue)
    })
    return map;
  }
  @action addWalk = walk=>{
    // logit('raw walk', toJS(walk), this.walks.size);
    this.walks.set(walk._id, new Walk(toJS(walk)))
  }
  @action setActiveWalk = walk=>{
    logit('setActiveWalk', walk)
    this.activeWalk = walk;
  }

  @action addWalks = walks=>{
    // logit('walks', walks)
    walks.filter(walk => walk.type === 'walk').map( walk=>this.addWalk(walk) );
  }

  @action changeDoc = ({deleted, doc, _id, ...rest})=>{
    logit('changeDoc', {deleted, doc, rest})
    let walk = this.walks.get(_id)
    if (deleted){
      if (doc._rev === walk._rev)this.walks.delete(doc._id)
      return;
    }
    if (!walk){
      this.addWalk(doc);
      return
    }
    if (doc._rev === walk._rev) return; // we already know about this
    walk.updateDocument(doc)
    // this.addWalk(doc)
    // logit('changedDoc', toJS(walk))
  }

  @action loadWalks = async () => {
    // const data = await db.allDocs({include_docs: true, conflicts: true, startkey: 'W', endkey: 'W9999999' });
    const data = await db.allDocs({include_docs: true, conflicts: true, startkey: 'W2016-11-01', endkey: 'W2017-02-28' });
    /* required in strict mode to be allowed to update state: */
    logit('allDocs', data)
    runInAction('update state after fetching data', () => {
      this.addWalks(data.rows.map(row=>row.doc))

      this.loaded = true;
      logit('WalkStore', this, this.walks)
    })
    logit('conflictingWalks', this.conflictingWalks)
    for(let walk of this.conflictingWalks){
      walk._conflicts = walk._conflicts.sort((a,b)=>getRev(b)-getRev(a))
      let confs = await db.get(walk._id, {open_revs: walk._conflicts, include_docs:true})
      logit('conflicting docs', confs)
      runInAction('addConflicting docs', ()=>{
        this.walks[walk._id].conflicts = confs.map((row)=>row.ok);
        logit('walk:with conflicts', this.walks[walk._id])
      })
    }
  }
}
var coll = new Intl.Collator();
var idCmp = (a, b) => coll.compare(a._id, b._id);

const getRev = (rev)=> parseInt(rev.split('-')[0]);

const walksStore = new WalksStore();

export default walksStore;
export { WalksStore };