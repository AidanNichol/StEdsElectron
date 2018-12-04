import React from 'react';
import { observable, toJS, action, decorate } from 'mobx';
import { observer } from 'mobx-react';
import { Icon } from '../../utility/Icon';
import { PaymentHelpDialog } from '../../help/PaymentHelpDialog';
import TooltipButton from '../../utility/TooltipButton.js';
import TooltipContent from '../../utility/TooltipContent.js';
import styled from 'styled-components';
import Select from 'react-select';
import Logit from 'logit';
var logit = Logit(__filename);

const paymentOptions = [
  { value: 'P', label: 'Paid cash' },
  { value: 'PX', label: 'Refund Payment' },
  { value: 'T', label: 'Paid via Treasurer' },
  { value: 'TX', label: 'Refund via Treasurer' },
  { value: '+', label: 'Add Credit' },
  { value: '+X', label: 'Remove Credit' },
];
class UiStatus {
  // helpIsOpen = false;
  paymentType = paymentOptions[0];

  self = this;
  changePaymentType = type => {
    logit('changePaymentType', type, this);
    this.paymentType = type;
  };
  resetPaymentType = () => {
    this.paymentType = paymentOptions[0];
    logit('resetPaymentType', toJS(this));
  };
  // showHelp = () => {
  //   this.helpIsOpen = true;
  // };
  // toggleHelp = () => {
  //   this.helpIsOpen = !this.helpIsOpen;
  // };
  // hideHelp = () => {
  //   this.helpIsOpen = false;
  // };
}
decorate(UiStatus, {
  helpIsOpen: observable,
  paymentType: observable,
  changePaymentType: action,
  resetPaymentType: action,
  showHelp: action,
  hideHelp: action,
});
export const uiStatus = new UiStatus();

const PaymentsBoxesUnstyled = observer(props => {
  const IconValue = ({ data, innerProps }) => (
    <div {...innerProps}>
      &nbsp;
      <Icon type={data.value} />
      {data.label}
    </div>
  );

  const { accId, owing, credit, accountUpdatePayment } = props;
  const paymentType = uiStatus.paymentType || paymentOptions[0];
  logit('PaymentsBoxes:props', paymentType, props);
  if (!accId) return null;
  let handleKeydown = event => {
    logit('keydown', { amount, note, event });
    if (event.which === 13 && amount) {
      event.preventDefault();
      amount = parseInt(amount);
      // if (paymentType.type[1] === 'X')amount = -amount;
      accountUpdatePayment(
        accId,
        amount,
        note,
        paymentType.type,
        paymentType.type[1] === 'X' && amount === owing,
      );
      if (amountTarget) amountTarget.value = '';
      if (noteTarget) noteTarget.value = '';
      uiStatus.changePaymentType(undefined);
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
  const Option = props =>
    props.value === '+X' && !credit ? null : <IconValue {...props} />;
  const SingleValue = props => <IconValue {...props} />;

  const customStyles = {
    menu: provided => {
      let { top, ...providedO } = provided; //eslint-disable-line no-unused-vars
      return { ...providedO, bottom: '100%' };
    },
  };

  return (
    <div className={props.className}>
      {credit ? <span className="credit">Credit £{credit}</span> : null}
      {!owing ? (
        <span />
      ) : (
        <div>
          <TooltipButton
            lable={`Payment Due £${owing}`}
            onClick={paidInFull}
            tiptext="Paid Full Amount"
            visible
          />
          &nbsp; or &nbsp;
        </div>
      )}
      <div className="payment-boxes">
        <Select
          onChange={uiStatus.changePaymentType.bind(uiStatus)}
          components={{ Option, SingleValue }}
          styles={customStyles}
          options={paymentOptions}
          defaultValue={uiStatus.paymentType || paymentOptions[0]}
        />
        £
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
        {/* <div
          className="pt-icon-standard pt-icon-help"
          onClick={() => uiStatus.toggleHelp()}
          style={{ justifySelf: 'center' }}
        >
          &nbsp;
        </div> */}
        <PaymentHelpDialog />
      </div>
    </div>
  );
});
export const PaymentsBoxes = styled(PaymentsBoxesUnstyled)`
  grid-column: 1 / span 2;
  grid-row: 3;
  min-height: 1px;
  margin-top: 10px;
  display: grid;
  grid-template-columns:auto 1fr;
  align-items: center;
  margin-left: 10px;
  
  .payment-boxes {
    display: grid;
    grid-template-columns: 220px 15px 55px 30px 1fr 50px;
    align-items: center;
    background: rgb(238, 238, 238);
    border: rgb(170, 170, 170) solid 2px;
    border-radius: 4px;
    padding: 5px;
    padding-right: 0;
    margin-left:0;
    margin-top:5px;
  }

    .pt-icon-help {
      cursor: pointer;
    }
  }
`;

// const MySelect = styled(Select)`
//   width: 180px;

//   .Select-control {
//     width: 200px;
//     background-color: rgb(238, 238, 238);
//   }

//   .Select-menu-outer {
//     min-height: 215px;
//     margin-bottom: 10px;
//   }

//   .Select-menu {
//     min-height: 210px;
//   }

//   .disabled {
//     color: #ccc;
//   }

//   .Select-multi-value-wrapper {
//     overflow: hidden;
//     white-space: nowrap;
//   }

//   .icon {
//     height: 16px;
//   }
// `;
