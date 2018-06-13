import { PaymentsBoxes as paymentsBoxes } from 'components/views/bookings/PaymentsBoxes';
import { inject, observer } from 'mobx-react';
import Logit from 'logit';
// var logit = Logit(__filename);
var logit = Logit(__filename);

const mapStoreToProps = function(store, { accId, ...props }) {
  // let accountCurrent = accId ? state.accounts.list[accId] : {};
  logit('store', { store, accId, props });
  var account = accId && store.AS.accounts.get(accId);
  logit('store 2', account);
  var balance = account && account.accountStatus.balance;
  var credit = balance > 0 ? balance : 0;
  var owing = balance < 0 ? -balance : 0;
  logit('mapStateToProps', { accId, credit, owing });

  return {
    accountUpdatePayment: (accId, amount, note = '', paymentType, inFull) =>
      account.makePaymentToAccount({
        accId,
        amount,
        note,
        paymentType,
        inFull,
      }),
    accId,
    credit,
    owing,
  };
};

export const PaymentsBoxes = inject(mapStoreToProps)(observer(paymentsBoxes));
