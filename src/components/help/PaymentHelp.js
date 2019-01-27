import React from 'react';
import { Icon } from '../utility/Icon';
export const PaymentHelp = () => (
  <div className="payments-help">
    <dl>
      <dt>
        <Icon type="P" /> Paid cash
      </dt>
      <dd>
        Use this option when the user has handed over cash or cheques to pay for walks.
        This can also be payment for future, unspecified walks that have not yet been
        booked, i.e. purchasing credits. Enter the net amount receieved, e.g. if a member
        has a cheque for £40 but has forgotten they have a credit and you give them £8
        cash as change then just enter £32.
      </dd>
      <dt>
        <Icon type="PX" /> Refund Payment
      </dt>
      <dd>
        Use this option where money has been handed over to the member in order to clear
        credits that the member may have.
      </dd>
      <dt>
        <Icon type="T" /> Paid via Treasure
      </dt>
      <dd>
        Use this option when payment has been made directly to the treasurer, usually via
        some form of bank transfer such as a bacs payment.
      </dd>
      <dt>
        <Icon type="TX" /> Refund via Treasurer
      </dt>
      <dd>
        Use this option when the treasurer has made refund for walks payments, e.g.
        credits have been refunded to the member by cheque or some form of bank transfer.
      </dd>
      <dt>
        <Icon type="+" /> Add Credit
      </dt>
      <dd>
        This option is used to give the member credits when no new payments are recieved
        from the member, e.g. credits have been allowed in some special circumstance. It
        may also be necessary to use this to adjust for errors in this system.
      </dd>
      <dt>
        <Icon type="+X" /> Remove Credit
      </dt>
      <dd>
        Used to remove the credits from the members account. e.g. in order to transfer
        credits to another member.
      </dd>
    </dl>
    Each of these options are ordered in pairs. In the pair each is the opposite of the
    other so if a transaction has been entered by mistake it can be negated by using the
    other member of the pair. When this is done simply enter the same amount as in the
    original entry (it is no longer necessary to enter negative values)
    <h4>Note</h4>
    <p>
      When taking payments a pot of cash and cheques is being accumulated to be handed
      over to the treasurer. The first two options in this list,{' '}
      <Icon type="P" height="15px" /> & <Icon type="PX" height="15px" />, should be used
      if, and only if, it affects that pot of money. It should be possible to reconcile
      the pot of money with the sum of these transactions.
    </p>
  </div>
);
