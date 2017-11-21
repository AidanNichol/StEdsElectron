// import {getSettings} from 'ducks/settings-duck';
import { getSettings } from 'ducks/settings-duck';
import {
  observable,
  computed,
  action,
  runInAction,
  toJS,
  reaction,
  autorun
} from 'mobx';
// import {setActiveAccount} from 'mobx/AccountsStore'
import db from 'services/bookingsDB';
import Member from 'mobx/Member';
// import R from 'ramda';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'mobx:MembersStore');

var coll = new Intl.Collator();

// export let membersLoading;

class MembersStore {
  @observable dispStart = 0;
  dispLength = 23;
  @observable sortProp = 'name';
  @observable modalOpen = false;

  members = observable.map({});
  @observable activeMemberId;
  @observable loaded = false;
  editMember;
  constructor() {
    this.activeMemberId = null;
    // membersLoading = this.loadMembers();
    reaction(
      () => this.activeMemberId,
      () => {
        logit('activeMemberId set:', this.activeMemberId);
        // const member = this.members.get(this.activeMemberId);
        // member && setActiveAccount(member.accountId);

        this.resetEdit();
        this.syncToIndex();
      }
    );
    reaction(
      () => this.sortProp,
      () => {
        this.syncToIndex();
        logit('members sortProp set:', this.sortProp);
      }
    );
    autorun(() => logit('autorun loaded', this.loaded));
  }
  // membersLoading: () => membersLoading;

  @action
  syncToIndex() {
    if (!this.activeMemberId) return (this.dispStart = 0);
    let i = this.membersSorted.findIndex(
      mem => mem._id === this.activeMemberId
    );
    logit('resync', {
      i,
      dispStart: this.dispStart,
      dispLength: this.dispLength,
      dispLast: this.dispStart + this.dispLength - 1
    });
    if (i >= this.dispStart && i <= this.dispStart + this.dispLength - 1)
      return; // already showing on current page
    this.dispStart = Math.max(i - 11, 0); // postion in middle of page
    logit('syncToIndex', 'done');
  }

  @computed
  get activeMember() {
    if (!this.activeMemberId) return {};
    return this.members.get(this.activeMemberId);
  }

  @computed
  get selectNamesList() {
    return this.members.values().map(member => {
      return {
        value: member._id,
        memId: member._id,
        accId: member.accountId,
        label: member.fullNameR
      };
    });
  }

  @computed
  get membersSorted() {
    return this.sortProp === 'name'
      ? this.membersSortedByName
      : this.membersSortedByMemNo;
  }

  @computed
  get membersSortedByName() {
    const cmp = (a, b) => coll.compare(a.fullNameR, b.fullNameR);
    return this.members.values().sort(cmp);
  }

  @computed
  get membersSortedByMemNo() {
    const cmp = (a, b) => a.memNo - b.memNo;
    return this.members.values().sort(cmp);
  }

  @action
  getMemberByMemNo(id) {
    return this.members.get(id);
  }

  @action
  createNewMember = () => {
    const memNo =
      this.members.values().reduce((max, mem) => Math.max(max, mem.memNo), 0) +
      1;
    this.editMember = new Member({
      _id: 'M' + memNo,
      memberId: 'M' + memNo,
      accountId: 'A' + memNo,
      newMember: true
    });
    logit('createNewMember', memNo, this.editMember);
  };

  @action
  addMember = member => {
    this.members.set(member._id, new Member(member));
  };

  @action
  deleteMember = memId => {
    const member = this.members.get(memId);
    if (member) {
      logit('delete Member ', memId, member.fullName);
      member._deleted = true;
      member.dbUpdate();
    }
    this.activeMemberId = null;
  };

  @action
  setActiveMember = memberId => {
    this.activeMemberId = memberId;
  };

  @action
  setActiveMemberId = memberId => {
    this.activeMemberId = memberId;
  };

  @action
  setSortProp = seq => {
    this.sortProp = seq;
  };

  @action
  setDispStart = no => {
    this.dispStart = no;
  };

  @action
  resetEdit = () => {
    if (!this.newMember) {
      // won't match if new member being created
      if (this.activeMember)
        this.editMember = new Member(toJS(this.activeMember));
      else this.editMember = undefined;
    } else {
      const { _id, accountId, memberId, newMember } = this.editMember;
      this.editMember = new Member({ _id, accountId, memberId, newMember });
    }
  };

  @action
  saveEdit = () => {
    // const {newMember, ...data} = toJS(this.editMember);
    delete this.editMember.newMember;
    this.members.set(this.editMember._id, new Member(toJS(this.editMember)));
    this.activeMemberId = this.editMember._id;
    this.activeMember.dbUpdate();
  };

  @computed
  get membersIndex() {
    return this.sortProp === 'name'
      ? this.membersIndexByName
      : this.membersIndexByNumber;
  }

  @computed
  get membersIndexByName() {
    const members = this.membersSortedByName;
    let key = [],
      index = {},
      lastKey = '';
    members.forEach((mem, i) => {
      let c = mem.lastName[0];
      if (c !== lastKey) {
        lastKey = c;
        key.push([c, c, i]);
        index[c] = 0;
      }
      index[c]++;
    });
    return { key, index };
  }

  @computed
  get membersIndexByNumber() {
    const members = this.membersSortedByMemNo;
    let key = [],
      index = {};
    let bsize = Math.ceil(members.length / 24);
    for (var i = 0; i < members.length; i = i + bsize) {
      let c = members[i].memberId;
      key.push(['○', c, i]);
      index[c] = i;
    }
    return { key, index };
  }

  @action
  changeDoc = ({ deleted, doc, id, ...rest }) => {
    let member = this.members.get(id);
    logit('changeDoc', { deleted, doc, id, member, rest });
    if (deleted) {
      if (member && doc._rev === member._rev) this.members.delete(id);
      if (this.activeMemberId === id) this.activeMemberId = null;
      return;
    }
    if (!member) {
      this.addMember(doc);
    } else {
      if (doc._rev === member._rev) return; // we already know about this
      if (!doc._id) {
        logit('changeDoc bad', { deleted, doc, id, member, rest });
        return;
      }
      member.updateDocument(doc);
    }
  };

  @action
  async init() {
    // loadMembers
    logit('loading members', '');
    const data = await db.allDocs({
      include_docs: true,
      startkey: 'M',
      endkey: 'M9999999'
    });
    /* required in strict mode to be allowed to update state: */
    runInAction('update state after fetching data', () => {
      data.rows
        .map(row => row.doc)
        .filter(doc => doc.type === 'member')
        .sort(lastnameCmp)
        .map(doc => this.addMember(doc));
      const savedValues = localStorage.getItem('stEdsRouter');
      if (getSettings('router.enabled') && savedValues) {
        const memId = JSON.parse(savedValues).memberId;
        if (this.members.has(memId))
          this.activeMemberId = JSON.parse(savedValues).memberId;
      }
      this.loaded = true;
    });
  }
}

export var lastnameCmp = (a, b) =>
  coll.compare(
    a.lastName + ', ' + a.firstName,
    b.lastName + ', ' + b.firstName
  );

const membersStore = new MembersStore();

export const setActiveMember = memId => membersStore.setActiveMember(memId);
export const getAccountForMember = memId => {
  const member = membersStore.members.get(memId);
  return member && member.accountId;
};
export default membersStore;
export { MembersStore };
