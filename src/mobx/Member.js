import {merge} from 'lodash'
import { observable, computed, action, runInAction, autorun} from 'mobx';


export default class Member {
   _id =  0;
  type =  'member';
  @observable memberId =  0;
  @observable accountId =  0;
  @observable firstName =  '';
  @observable lastName =  '';
  @observable address =  '';
  @observable phone =  '';
  @observable email =  '';
  @observable mobile =  '';
  @observable joined =  '';
  @observable nextOfKin =  '';
  @observable medical =  '';
  @observable memberStatus =  'Guest';
  @observable suspended =  false;
  @observable subscription =  '';

  constructor(member) {
    // autorun(() => console.log('autorun Member', this.report, this));
    for(let [key, val] of Object.entries(member)){
      this[key] = val;
    }
  }

  @computed get report() {
		return `Member: ${this._id} ${this.fullName}`;
	}
  @computed get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  @computed get fullNameR() {
    return `${this.lastName}, ${this.firstName}`;
  }

  shortName(account) {
    return account.members.length > 1 ? this.firstName : '';
  }
  @action updateDocument = member=>{
    merge(this, member)
    return;
  }
  @action saveDocument = async (fields) => {
    const data = await fetchDataFromUrl();
    /* required in strict mode to be allowed to update state: */
    runInAction('update state after fetching data', () => {
        this.data.replace(data);
        this.isSaving = true;
    })
  }
}
