import React from 'react';
import {Icon} from 'ducks/walksDuck'
export const PaymentHelp = ()=>(
  <div className="payments-help">
    <dl>
      <dt><Icon type="P"/> Paid cash</dt>
      <dd>
        Use this option when the user has handed over cash or cheques to pay for walks.
        This can also be payment for future, unspecified walks that have not yet been booked, i.e. putchasing credits.
      </dd>
      <dt><Icon type="PX"/> Refund Payment</dt>
      <dd>
          Use this option where money has been handed over the member in order
          to clear credits that the member may have.
      </dd>
      <dt><Icon type="T"/> Paid via Treasure</dt>
      <dd>
          Use this option when payment has been made directly to the treasurer, usually via some form of bank transfer
          such as a bacs payment.
      </dd>
      <dt><Icon type="TX"/> Refund via Treasurer</dt>
      <dd>
        Use this option when the treasurer has made refund for walks payments, e.g. credits have been refunded to the member
        by cheque or some form of bank transfer.
      </dd>
      <dt><Icon type="+"/> Add Credit</dt>
      <dd>
        This option is used to give the member credits when no new payments are
        recieved from the member, e.g. a cancelation received in time but not entered
        immediately and so processed as a late cancellation with no credit automatically issued.
        In general, it is used to adjust for errors or if the committee awards credits
        in a special circumstance.
      </dd>
      <dt><Icon type="+X"/> Remove Credit</dt>
      <dd>
        Used to remove the credits from the members account. e.g. in order to transfer credits to another member.
      </dd>
    </dl>
    Each of these options are ordered in pairs. In the pair each is the opposite of the other so if
    a transaction has been entered by mistake it can be negated by using the other member of the pair.
    <h4>Note</h4>
    <p>
      When taking payments a pot of cash and cheques is being accumulated to be handed
      over to the treasurer. The first two options in this list should be used if, and
      only if, it affects that pot of money. It should be possible to reconcile the
      money with the sum of those transactions.
    </p>
  </div>
);
