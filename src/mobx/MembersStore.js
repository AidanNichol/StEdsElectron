// import {getSettings} from 'ducks/settings-duck';
import { observable, computed, action, runInAction, asMap, autorun} from 'mobx';
import db from 'services/bookingsDB';
import Member from './Member'
import R from 'ramda';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:MembersStore');

class MembersStore {


  @observable members = asMap({});
  @observable activeMember;
  @observable loaded = false;

  constructor() {
    this.activeMember = null;
    this.loadMembers();
  }
  @action addMember = member=>{
    this.members.set(member._id, new Member(member))
  }

  @action changeDoc = ({deleted, doc, ...rest})=>{
    let member = this.members.get(doc._id)
    logit('changeDoc', {deleted, doc, member, ...rest})
    if (deleted){
      if (doc._rev === member._rev)delete this.members[doc._id]
      return;
    }
    if (!member){
      this.addMember(doc);
    }
    if (doc._rev === member._rev) return; // we already know about this
    member.updateDocument(doc)
  }


  @action loadMembers = async () => {
    const data = await db.allDocs({include_docs: true, startkey: 'M', endkey: 'M9999999' });
    /* required in strict mode to be allowed to update state: */
    runInAction('update state after fetching data', () => {
      data.rows.filter(row => row.doc.type === 'member').map(
        row=>this.addMember(row.doc)
      );
      this.loaded = true;
    })
  }
}



const membersStore = new MembersStore();

export default membersStore;
export { MembersStore };
