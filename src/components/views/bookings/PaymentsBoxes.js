import React, { useState } from 'react';
import { observable, toJS, action, decorate } from 'mobx';
import { observer } from 'mobx-react';
import { Icon } from '../../utility/Icon';
import { PaymentHelpDialog } from '../../help/PaymentHelpDialog';
import TooltipButton from '../../utility/TooltipButton.js';
import TooltipContent from '../../utility/TooltipContent.js';
import styled from 'styled-components';
import Select from 'react-select';
import Logit from 'logit';
import { isNoSubstitutionTemplateLiteral } from 'typescript';
var logit = Logit(__filename);

const paymentOptions = [
  { type: 'P', label: 'Paid cash' },
  { type: 'PX', label: 'Refund Payment' },
  { type: 'T', label: 'Paid via Treasurer' },
  { type: 'TX', label: 'Refund via Treasurer' },
  { type: '+', label: 'Add Credit' },
  { type: '+X', label: 'Remove Credit' },
];

const PaymentsBoxesUnstyled = props => {
  const PushUpSelectUnstyled = ({ options, value, changed, className }) => {
    const [showOptions, setShowOptions] = useState(false);
    const toggleShow = () => {
      setShowOptions(!showOptions);
      logit('toggle showOptions', showOptions);
    };
    const open = showOptions ? ' open' : ' closed';
    logit('PushUpSelect', options, value);
    return (
      <div onClick={toggleShow} className={'payment-types ' + className + open}>
        <div className={showOptions ? 'show' : 'hide'}>
          {options.map(option => (
            <div onClick={() => changed(option)}>
              <Icon type={option.type} /> {option.label}
            </div>
          ))}
        </div>
        <div className="valueBox">
          <Icon type={value.type} /> {value.label}
        </div>
      </div>
    );
  };
  const PushUpSelect = styled(PushUpSelectUnstyled)`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow-y: visible;
    cursor: pointer;
    max-height: 52px;
    align-self: flex-end;
    margin-right: 8px;
    &.open {
      position: relative;
      bottom: 14px;
    }
    div.hide {
      display: none;
    }
    div.show {
      background-color: #fff;
      border: 1px solid hsl(0, 0%, 90%);
    }
    .valueBox {
      border: 1px solid hsl(0, 0%, 80%);
      border-radius: 5px;
      height: 38px;
      background-color: #fff;
      min-height: 38px;
      padding-top: 6px;
    }
  `;
  const [paymentType, setPaymentType] = useState(paymentOptions[0]);
  const { accId, owing, credit, accountUpdatePayment } = props;
  logit('PaymentsBoxes:props', paymentType, props);
  if (!accId) return null;
  let handleKeydown = event => {
    if (event.which === 13 && amount) {
      event.preventDefault();
      amount = parseInt(amount);
      accountUpdatePayment(
        accId,
        amount,
        note,
        paymentType.type,
        paymentType.type[1] === 'X' && amount === owing,
      );
      if (amountTarget) amountTarget.value = '';
      if (noteTarget) noteTarget.value = '';
      setPaymentType(paymentOptions[0]);
    }
  };
  let amount = '',
    note = '';
  let amountTarget = '',
    noteTarget = '';
  let amountChange = event => {
    amount = event.target.value;
    amountTarget = event.target;
  };
  let noteChange = event => {
    note = event.target.value;
    noteTarget = event.target;
  };
  let paidInFull = event => {
    accountUpdatePayment(accId, owing, note, 'P', true);
    event.target.value = '';
  };

  return (
    <div className={props.className}>
      <div>
        {credit ? <span className="credit"> Credit £ {credit} &nbsp;</span> : null}
        {owing ? (
          <div>
            <TooltipButton
              lable={`Payment Due £${owing}`}
              onClick={paidInFull}
              tiptext="Paid Full Amount"
              visible
            />
            &nbsp; or &nbsp;
          </div>
        ) : null}
      </div>
      <div className="payment-boxes">
        <PushUpSelect
          options={paymentOptions}
          value={paymentType}
          changed={setPaymentType}
        />
        &nbsp;£
        <TooltipContent tiptext="Enter paid amount and press enter" visible>
          <input size="3" type="text" onKeyDown={handleKeydown} onChange={amountChange} />
        </TooltipContent>
        Note
        <input
          style={{ marginLeft: 8 }}
          className="note"
          type="text"
          placeholder="Optionally Enter text and press enter"
          onKeyDown={handleKeydown}
          onChange={noteChange}
        />
        <PaymentHelpDialog />
      </div>
    </div>
  );
};
export const PaymentsBoxes = styled(PaymentsBoxesUnstyled)`
  grid-column: 1 / span 2;
  grid-row: 3;
  min-height: 1px;
  margin-top: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  margin-left: 10px;

  .payment-boxes {
    display: grid;
    grid-template-columns: 225px 15px 55px 30px 1fr 50px;
    align-items: baseline;
    background: rgb(238, 238, 238);
    border: rgb(170, 170, 170) solid 2px;
    border-radius: 4px;
    padding: 5px;
    padding-right: 0;
    margin-left: 0;
    margin-top: 5px;
    max-height: 52px;
  }
  .payment-boxes > div:not(.payment-types) {
    padding-top: 8px;
  }

  .pt-icon-help {
    cursor: pointer;
  }
`;
