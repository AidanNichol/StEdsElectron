import React from 'react';
import { inject, observer } from 'mobx-react';
import { observable, autorun, toJS } from 'mobx';
import PaymentsDue from 'components/views/PaymentsDue2.js';
import PaymentsMade from 'components/views/PaymentsReceived.js';
// import {mapStoreToProps as buildDoc} from 'components/views/PaymentsSummary';
import { setRouterPage } from 'ducks/router-mobx.js';
import XDate from 'xdate';
import { flatten } from 'lodash';
// import fs from 'fs';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);
var nameColl = new Intl.Collator();
var nameCmp = (a, b) => nameColl.compare(a.sortname, b.sortname);

const uiState = observable({
  displayingDue: true,
  showPaymentsDue: () => {
    uiState.displayingDue = true;
  },
  showPaymentsMade: () => {
    uiState.displayingDue = false;
  },
});
autorun(() =>
  logit(
    'Changed Displaying. Now showing:',
    uiState.displayingDue ? 'PaymentsDue' : 'PaymentsMade',
  ),
);

const mapStoreToProps = function(store) {
  store.AS.fixupAllAccounts();
  const accs = store.AS.allAccountsStatus.sort(nameCmp);
  // var { debts, credits } = store.AS.allDebts;
  // credits = credits.map(acc => {
  //   let logs = [];
  //   for (let log of acc.logs.reverse()) {
  //     if (log.balance === 0) break;
  //     logs.unshift(log);
  //   }
  //   acc.logs = logs;
  //   return acc;
  // });
  // debts.forEach((data, i) => {
  //   debts[i].debt = data.debt.filter(bkng => bkng.outstanding);
  // });
  // logit("debts", debts);
  // logit("credits", credits);
  const totalPaymentsMade = accs.reduce(
    (sum, log) => sum + log.paymentsMade,
    0,
  );
  return {
    accs: accs.filter(acc => acc.activeThisPeriod || acc.balance < 0),
    totalPaymentsMade,
    startDate: store.PS.periodStartDate,
    showPaymentsDue: uiState.showPaymentsDue,
    showPaymentsMade: uiState.showPaymentsMade,
    debts: accs.filter(acc => acc.balance < 0),
    bankMoney: store.PS.bankMoney,
    doc: buildDoc(store),
    lastWalk: lastWalkSummary(store),
    showMemberBookings: accId =>
      setRouterPage({ page: 'bookings', memberId: accId, accountId: accId }),
  };
};
const Frame = observer(props => (
  <div style={{ width: '100%', height: '100%' }}>
    {uiState.displayingDue ? (
      <PaymentsDue {...props} />
    ) : (
      <PaymentsMade {...props} />
    )}
  </div>
));
export default inject(mapStoreToProps)(Frame);
// export default connect(()=>({test2:'?'}), mapDispatchToProps)(mobxPayments);

const lastWalkSummary = function({ WS }) {
  const walk = WS.lastWalk;
  logit('lastWalk', walk);

  if (!walk || walk.closed) return null;
  let totals = { B: 0, BL: 0, BX: 0, C: 0, CX: 0 };
  walk.bookings.values().map(({ status }) => {
    if (/^[BC]/.test(status)) totals[status] += 1;
  });
  return { totals, date: walk.dispDate, venue: walk.venue, fee: walk.fee };
};

const buildDoc = function({ AS, DS, WS, PS }) {
  var openingCredit = PS.openingCredit,
    openingDebt = -PS.openingDebt,
    startDate = PS.lastPaymentsBanked,
    endDate = AS.paymentsLogsLimit || DS.getLogTime();
  logit('range data', { startDate, endDate, openingCredit, openingDebt });
  const accountsStatus = toJS(AS.allAccountsStatus).sort(nameCmp);
  const filterCurrentLogs = logs =>
    logs.filter(({ dat }) => dat > startDate && dat < endDate);
  logit('accountsStatus', accountsStatus);
  var cLogs = flatten(accountsStatus.map(acc => filterCurrentLogs(acc.logs)));
  var payments = accountsStatus.filter(acc => acc.paymentsMade > 0);
  var tots = cLogs.reduce((tot, lg) => {
    if (!tot[lg.req]) tot[lg.req] = [0, 0];
    tot[lg.req][0]++;
    tot[lg.req][1] += Math.abs(lg.amount);
    return tot;
  }, {});
  let currentPeriodStart = WS.currentPeriodStart;
  var doc = {
    _id: 'BP' + endDate.substr(0, 16),
    type: 'paymentSummary',
    startDispDate: startDate && new XDate(startDate).toString('dd MMM HH:mm'),
    endDispDate: new XDate(endDate).toString('dd MMM HH:mm'),
    closingCredit: accountsStatus
      .filter(acc => acc.balance > 0)
      .reduce((sum, item) => sum + item.balance, 0),
    closingDebt: accountsStatus
      .filter(acc => acc.balance < 0)
      .reduce((sum, item) => sum + item.balance, 0),
    openingCredit,
    openingDebt,
    endDate,
    startDate,
    payments,
    accounts: accountsStatus.filter(
      acc => acc.activeThisPeriod || acc.balance < 0,
    ),
    currentPeriodStart,
    unclearedBookings: AS.unclearedBookings(currentPeriodStart),
    // aLogs, bLogs,
    cLogs,
    tots,
  };
  logit('logs doc', doc, __dirname);

  logit.table(
    flatten(Object.values(doc.unclearedBookings)),
    // .map(bkng => ({
    //   // name: MS.getMemberByMemNo(bkng.memId).fullName,
    //   ...pick(bkng, ['memId', 'req', 'text', 'dispDate', 'walkId'])
    // }))
  );
  logit.table(doc.unclearedBookings);
  // fs.writeFileSync(`${__dirname}/../../../tests/paymentsFrom${startDate.substr(0,16).replace(/:/g, '.')}.json`, JSON.stringify(doc))
  // logit('write report');
  // paymentsSummaryReport(doc)
  return doc;
};
