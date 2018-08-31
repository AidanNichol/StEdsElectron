import React from 'react';
import { observable, toJS, action } from 'mobx';
import { observer } from 'mobx-react';
import { Icon } from '../../utility/Icon';
import { PaymentHelp } from '../../help/PaymentHelp';
import { HelpDialog } from '../../help/HelpDialog';
import TooltipButton from '../../utility/TooltipButton.js';
import TooltipContent from '../../utility/TooltipContent.js';
import classNames from 'classnames';
import styled from 'styled-components';
import Select from 'react-select';
import Logit from 'logit';
var logit = Logit(__filename);

const OPTIONS = [
  { type: 'P', title: 'Paid cash' },
  { type: 'PX', title: 'Refund Payment' },
  { type: 'T', title: 'Paid via Treasurer' },
  { type: 'TX', title: 'Refund via Treasurer' },
  { type: '+', title: 'Add Credit' },
  { type: '+X', title: 'Remove Credit' },
];
class UiStatus {
  @observable
  helpIsOpen = false;
  @observable
  paymentType;

  self = this;
  @action.bound
  changePaymentType(type) {
    logit('changePaymentType', type, this);
    this.paymentType = type;
  }
  @action.bound
  resetPaymentType() {
    this.paymentType = undefined;
    logit('resetPaymentType', toJS(this));
  }
  @action.bound
  showHelp() {
    this.helpIsOpen = true;
  }
  @action.bound
  hideHelp() {
    this.helpIsOpen = false;
  }
}
export const uiStatus = new UiStatus();

const PaymentsBoxesUnstyled = observer(props => {
  // render () {
  const IconOption = ({ option, className, onSelect, onFocus, isFocused }) => {
    const handleMouseDown = event => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(option, event);
    };
    const handleMouseEnter = event => {
      onFocus(option, event);
    };
    const handleMouseMove = event => {
      if (isFocused) return;
      onFocus(option, event);
    };
    const disabled = option.type === '+X' && !credit;

    return (
      <div
        className={classNames(className, { disabled })}
        onMouseDown={!disabled && handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        title={option.title}
      >
        <Icon type={option.type} />
        {option.title}
      </div>
    );
  };

  const IconValue = ({ value }) => (
    <span className="Select-value-label">
      &nbsp;
      <Icon type={value.type} />
      {value.title}
    </span>
  );
  const { accId, owing, credit, accountUpdatePayment } = props;
  const paymentType = uiStatus.paymentType || OPTIONS[0];
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
        <MySelect
          className="pt-select"
          onChange={uiStatus.changePaymentType.bind(uiStatus)}
          optionComponent={IconOption}
          options={OPTIONS}
          clearable={false}
          menuBuffer={800}
          value={uiStatus.paymentType || OPTIONS[0]}
          valueComponent={IconValue}
        />
        <TooltipContent tiptext="Enter paid amount and press enter" visible>
          <span>
            &nbsp;£ &nbsp;
            <input
              size="3"
              type="text"
              onKeyDown={handleKeydown}
              onChange={amountChange}
            />
          </span>
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
        <div
          className="pt-icon-standard pt-icon-help"
          onClick={() => uiStatus.showHelp()}
          style={{ justifySelf: 'center' }}
        >
          &nbsp;
        </div>
        <HelpDialog
          setHelp={uiStatus.hideHelp.bind(uiStatus)}
          isOpen={uiStatus.helpIsOpen}
        >
          <PaymentHelp />
        </HelpDialog>
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
    grid-template-columns: 210px 55px 30px 1fr 24px;
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

const MySelect = styled(Select)`
  width: 180px;

  .Select-control {
    width: 200px;
    background-color: rgb(238, 238, 238);
  }

  .Select-menu-outer {
    min-height: 215px;
    margin-bottom: 10px;
  }

  .Select-menu {
    min-height: 210px;
  }

  .disabled {
    color: #ccc;
  }

  .Select-multi-value-wrapper {
    overflow: hidden;
    white-space: nowrap;
  }

  .icon {
    height: 16px;
  }
`;
