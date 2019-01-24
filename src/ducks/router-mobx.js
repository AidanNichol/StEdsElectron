// import { getSettings} from 'StEdsSettings';
import { observable, action, toJS, reaction, decorate } from 'mobx';
import { setActiveMember, getAccountForMember } from 'mobx/MembersStore';
const { setActiveAccount } = require('mobx/AccountsStore');
const { setActiveWalk } = require('mobx/WalksStore');
// const WS = require('mobx/WalksStore');
// const setActiveWalk = memId => WS.setActiveWalk(memId);

import { merge } from 'lodash';
import Logit from 'logit';
const logit = Logit(__filename);
class Router {
  page = null;
  memberId = null;
  accountId = null;
  initialized = false;
  walkId = null;

  constructor() {
    // const savedValues = localStorage.getItem('stEdsRouter')
    // const savedRoutingEnabled = getSettings('router.enabled')
    // if (savedRoutingEnabled && savedValues)
    //   merge(this, JSON.parse(savedValues));
    // logit('constructor', savedValues, savedRoutingEnabled, this)
    reaction(
      () => {
        return {
          page: this.page,
          memberId: this.memberId,
          accountId: this.accountId,
          walkId: this.walkId,
        };
      },
      () => {
        // const = {}
        localStorage.setItem('stEdsRouter', JSON.stringify(toJS(this)));
        logit('toLocalStorage', toJS(this));
      },
    );
    reaction(
      () => this.memberId,
      memId => {
        setActiveMember(memId);
        if (memId) {
          const accId = getAccountForMember(memId);
          accId && setActiveAccount(accId);
        }
      },
      { fireImmediately: true },
    );
    reaction(() => this.accountId, accId => setActiveAccount(accId));
    reaction(() => this.walkId, walkId => setActiveWalk(walkId), {
      fireImmediately: true,
    });
  }

  setAndSaveState = payload => {
    merge(this, payload);
  };

  setPage = payload => {
    logit('setPage', payload);
    merge(this, payload);
    // this.resetAccountId();
  };

  setUser = (memberId, accountId) => {
    logit('setUser (act)', memberId, accountId);
    this.memberId = memberId[0] === 'M' ? memberId : null;
    // this.accountId = accountId[0] === 'A' ? accountId : null;
    // this.resetAccountId();
  };

  resetAccountId = () => {
    if (this.memberId && !this.accountId)
      this.accountId = getAccountForMember(this.memberId);
  };
}
decorate(Router, {
  page: observable,
  memberId: observable,
  accountId: observable,
  initialized: observable,
  walkId: observable,
  setAndSaveState: action,
  setPage: action,
  setUser: action,
  resetAccountId: action,
});
export const router = new Router();
export const setRouterPage = router.setPage;
export const setRouterUser = router.setUser;
