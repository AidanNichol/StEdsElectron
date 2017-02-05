import { getSettings} from 'ducks/settings-duck';
import {observable, action, autorun, toJS, reaction} from 'mobx';
import {setActiveMember, getAccountForActiveMember} from 'mobx/MembersStore'
import {setActiveAccount} from 'mobx/AccountsStore'
import {setActiveWalk} from 'mobx/WalksStore'
import {merge} from 'lodash';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Router:mobx');

class Router {

  @observable page = null
  @observable memberId = null
  @observable accountId = null
  @observable initialized = false
  @observable walkId = null

  constructor(){
    const savedValues = localStorage.getItem('stEdsRouter')
    const savedRoutingEnabled = getSettings('router.enabled')
    if (savedRoutingEnabled && savedValues)
      merge(this, JSON.parse(savedValues));
    logit('constructor', savedValues, savedRoutingEnabled, this)
    autorun(()=>{
      // const = {}
      localStorage.setItem('stEdsRouter', JSON.stringify(toJS(this)));
      logit('toLocalStorage', toJS(this));
    });
    reaction(()=>this.memberId, (memId)=>setActiveMember(memId))
    reaction(()=>this.accountId, (accId)=>setActiveAccount(accId))
    reaction(()=>this.walkId, (walkId)=>setActiveWalk(walkId))
  }
  @action setAndSaveState = (payload)=>{
    merge(this, payload);
  }
  @action setPage = (payload)=>{
    logit('setPage', payload)
    merge(this, payload);
    this.resetAccountId();
  }
  @action setUser = (memberId, accountId)=>{
    logit('setUser', memberId, accountId)
    this.memberId = memberId[0] === 'M' ? memberId : null;
    this.accountId = accountId[0] === 'A' ? accountId : null;
    this.resetAccountId();
  }
  @action resetAccountId = ()=>{
    if (this.memberId && !this.accountId) this.accountId = getAccountForActiveMember();
  }
}

export const router = new Router();
export const setRouterPage = router.setPage
export const setRouterUser = router.setUser
