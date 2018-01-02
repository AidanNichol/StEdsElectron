import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { changeLog } from '../views/bookings/PaymentStatusLog.js';
import Logit from '../../factories/logit.js';
var logit = Logit(__filename);
const uiState = observable({ showAll: false });

const mapStoreToPropsChangeLog = function(store, { accId, ...props }) {
  var startDate = store.AS.lastPaymentsBanked;
  logit('store', { store, accId, props });
  var account = accId && store.AS.accounts.get(accId);
  var logs = (account && account.accountStatus.logs) || [];
  if (account) logs = account.fixupAccLogs(logs);
  logit('store 2', logs, account && account.accountStatus);

  return {
    accId,
    logs,
    showAll: uiState.showAll,
    toggleShowAll: () => (uiState.showAll = !uiState.showAll),
    className: (props.className || '') + ' mobx',
    startDate,
    accountDeletePayment: (accId, dat) => {
      account.deletePayment(dat);
    },
    resetLateCancellation: (walkId, memId) =>
      store.WS.resetLateCancellation(walkId, memId)
  };
};

export const ChangeLogM = inject(mapStoreToPropsChangeLog)(observer(changeLog));
