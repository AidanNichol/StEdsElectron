import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { changeLog } from '../views/bookings/PaymentStatusLog.js';
import Logit from 'logit';
var logit = Logit(__filename);
const uiState = observable({
  showMode: 2,
  showAll: false,
  showOld: false,
  showHistory: true,
});

const mapStoreToPropsChangeLog = function(store, { accId, ...props }) {
  var startDate = store.AS.lastPaymentsBanked;
  logit('store', { store, accId, props });
  var account = accId && store.AS.accounts.get(accId);
  var logsO = (account && account.accountStatus.logs) || [];
  // if (account) logs = account.fixupAccLogs(logs);
  var logsN = (account && account.accountStatusNew.logs) || [];
  if (!uiState.showHistory) logsN = logsN.filter(log => !log.historic);
  logit('store 2', logsN, account && account.accountStatus);

  return {
    accId,
    logs: uiState.showOld ? logsO : logsN,
    logsN,
    showMode: uiState.showMode,
    showAll: uiState.showAll,
    showOld: uiState.showOld,
    showHistory: uiState.showHistory,
    changeMode: m => {
      uiState.showMode = m;
      uiState.showOld = m === 1;
      uiState.showHistory = m === 2;
      store.AS.setFullHistory(m === 2);
    },
    toggleShowHistory: () => (uiState.showHistory = !uiState.showHistory),
    toggleShowAll: () => (uiState.showAll = !uiState.showAll),
    toggleShowOld: () => (uiState.showOld = !uiState.showOld),
    className: (props.className || '') + ' mobx',
    startDate,
    accountDeletePayment: (accId, dat) => {
      account.deletePayment(dat);
    },
    resetLateCancellation: (walkId, memId) =>
      store.WS.resetLateCancellation(walkId, memId),
  };
};

export const ChangeLogM = inject(mapStoreToPropsChangeLog)(observer(changeLog));
