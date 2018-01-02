import { observable, computed, action, autorun } from 'mobx';
import db from 'services/bookingsDB';
import XDate from 'xdate';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);

export let paymentsSummaryLoading;
class PaymentsSummaryStore {
  @observable loaded = false;
  @observable lastPaymentsBanked = '';
  @observable openingCredit = 0;
  @observable openingDebt = 0;
  @observable paymentsLogsLimit;
  @observable currentPeriodStart;
  @observable id;
  previousUnclearedBookings;
  constructor() {
    // paymentsSummaryLoading = this.loadSumaryDocs();
    autorun(() => {
      logit('activeAccountId set:', this.activeAccountId);
      // if (this.activeAccountId === null)debugger;
    });
    autorun(() => logit('autorun loaded', this.loaded));
  }

  paymentsSummaryLoading: () => paymentsSummaryLoading;

  @computed
  get periodStartDate() {
    logit('periodStartDate', this.lastPaymentsBanked, this);
    return new XDate(this.lastPaymentsBanked).toString('ddd dd MMM');
  }

  @action
  changeBPdoc = doc => {
    if (doc.doc) doc = doc.doc;
    this.lastPaymentsBanked = doc.endDate;
    this.openingCredit = doc.closingCredit;
    this.openingDebt = doc.closingDebt;
    this.currentPeriodStart = doc.currentPeriodStart;
    this.previousUnclearedBookings = doc.unclearedBookings;
    this.id = doc._id;
    logit('changeBPdoc', doc, this.lastPaymentsBanked, this.currentPeriodStart);
  };

  /*------------------------------------------------------------------------*/
  /* replication has a new or changed account document                      */
  /*------------------------------------------------------------------------*/
  @action
  changeDoc = ({ deleted, doc, id, ...rest }) => {
    logit('changeDoc', { deleted, doc, id, rest });
    if (deleted) return;
    if (id <= this.id) return;
    this.changeBPdoc(doc);
  };

  @action
  bankMoney = async doc => {
    logit('bankMoney', doc);
    await db.put(doc);
    this.changeBPdoc(doc);
  };

  @action
  async init() {
    // const data = await db.allDocs({include_docs: true, conflicts: true, startkey: 'W', endkey: 'W9999999' });
    const dataBP = await db.allDocs({
      descending: true,
      limit: 1,
      include_docs: true,
      startkey: 'BP9999999',
      endkey: 'BP00000000',
    });
    logit('load datasummaries', dataBP);
    if (dataBP.rows.length > 0) this.changeBPdoc(dataBP.rows[0].doc);
    this.loaded = true;

    // runInAction('update state after fetching data', () => {
    // });
  }
}

const paymentsSummaryStore = new PaymentsSummaryStore();

export default paymentsSummaryStore;
export { PaymentsSummaryStore };
