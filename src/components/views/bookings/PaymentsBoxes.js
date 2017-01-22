import React from 'react';
import {observable, toJS, action } from 'mobx';
import {observer} from 'mobx-react';
import {Icon} from '../../../ducks/walksDuck'
import {PaymentHelp} from 'components/help/PaymentHelp';
import {HelpDialog} from 'components/help/HelpDialog';
import TooltipButton from 'components/utility/TooltipButton.js';
import TooltipContent from 'components/utility/TooltipContent.js';
import classNames from 'classnames';
import styled from 'styled-components';
import Select from 'react-select';
import Logit from 'factories/logit.js';
var logit = Logit('color:black; background:yellow;', 'payments:boxes');

const OPTIONS = [{type:"P", title:"Paid cash"},
{type:"PX", title:"Refund Payment"},
{type:"T", title:"Paid via Treasurer"},
{type:"TX", title:"Refund via Treasurer"},
{type:"+", title:"Add Credit"},
{type:"+X", title:"Remove Credit"},
];
class UiStatus {
  @observable helpIsOpen = false;
  @observable paymentType ;

  self = this;
  @action.bound changePaymentType(type){logit('changePaymentType', type, this);this.paymentType = type;}
  @action.bound resetPaymentType(){this.paymentType = undefined;logit('resetPaymentType', toJS(this))}
  @action.bound showHelp(){this.helpIsOpen = true;}
  @action.bound hideHelp(){this.helpIsOpen = false;}
}
export const uiStatus = new UiStatus;
const PaymentsBoxesUnstyled = observer(React.createClass({

  // getInitialState () {
  //   return {paymentType: OPTIONS[0], accId: undefined};
  // },
  // setValue (paymentType) {
  //   this.setState({ paymentType });
  // },
  render () {
    const IconOption = ({option, className, onSelect, onFocus, isFocused})=> {
      const handleMouseDown = (event)=> {
        event.preventDefault();
        event.stopPropagation();
        onSelect(option, event);
      };
      const handleMouseEnter = (event)=>{
        onFocus(option, event);
      };
      const handleMouseMove = (event)=>{
        if (isFocused) return;
        onFocus(option, event);
      };
        const disabled = (option.type === '+X' && !credit)

        return (
          <div className={classNames(className, {disabled})}
            onMouseDown={!disabled && handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            title={option.title}>
            <Icon type={option.type}/>
            {option.title}
          </div>
        );
      };

    const IconValue = ({value})=>(
            <span className="Select-value-label">&nbsp;
            <Icon type={value.type}/>
              {value.title}
            </span>
    );
    const {accId, owing, credit, accountUpdatePayment} = this.props
    const paymentType = uiStatus.paymentType || OPTIONS[0];
    logit('PaymentsBoxes:props', paymentType, this.props)
    if (!accId) return null
    let handleKeydown = (event)=> {
      logit('keydown', {amount, note, event});
      if ( event.which === 13 && amount) {
        event.preventDefault();
        amount = parseInt(amount);
        // if (paymentType.type[1] === 'X')amount = -amount;
        accountUpdatePayment(accId, amount, note, paymentType.type, paymentType.type[1] === 'X' && amount===owing);
        if (amountTarget)amountTarget.value = ''; if (noteTarget)noteTarget.value='';
        uiStatus.changePaymentType(undefined)
      }
    };
    let amount = '', note = '';
    let amountTarget = '', noteTarget = '';
    let amountChange = (event)=> { amount = event.target.value; amountTarget=event.target;};
    let noteChange = (event)=> { note = event.target.value; noteTarget=event.target;};
    let paidInFull = (event)=> {
      accountUpdatePayment(accId, owing, note, 'P', true);
      event.target.value = '';
    };

    return (
      <div className={this.props.className} >
        {credit ? <span className="credit">Credit £{credit}</span> : null}
        {/* {(!owing) || setPaymentType[0] != "P" || setPaymentType[1] !== 1 ? null : */}
        {!owing? null :
          <span>
            <TooltipButton lable={`Payment Due £${owing}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/> &nbsp; or
          </span>
        }
        <div className='payment-boxes' >
          {/* <span className="pay-box"> */}
          <MySelect
            className="pt-select"
            onChange={uiStatus.changePaymentType.bind(uiStatus)}
            optionComponent={IconOption}
            options={OPTIONS}
            clearable={false}
            menuBuffer={800}
            value={uiStatus.paymentType || OPTIONS[0]}
            valueComponent={IconValue}          />
          <TooltipContent tiptext='Enter paid amount and press enter' visible>
            <span> &nbsp;£ &nbsp;<input size="3" type="text" onKeyDown={handleKeydown} onChange={amountChange}/> </span>
            <span> Note &nbsp; <input size="30" type="text" onKeyDown={handleKeydown} onChange={noteChange}/> &nbsp;</span>
          </TooltipContent>
          <span className="pt-icon-standard pt-icon-help" onClick={()=>uiStatus.showHelp()}>&nbsp;</span>
          {/* </span> */}
          <HelpDialog setHelp={uiStatus.hideHelp.bind(uiStatus)} isOpen={uiStatus.helpIsOpen}>
            <PaymentHelp />
          </HelpDialog>
        </div>

      </div>
    );

  }
}));
export const PaymentsBoxes = styled(PaymentsBoxesUnstyled)`
  grid-column: 2;
  grid-row: 3;
  min-height: 1px;
  margin-top: 10px;
  max-height: 60px;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  margin-left: 10px;

  * + * {
    margin-left: 10px;
  }

  .payment-boxes {
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    background: rgb(238, 238, 238);
    border: rgb(170, 170, 170) solid 2px;
    border-radius: 4px;
    padding: 5px;
    padding-right: 0;
  }

    span {
      padding-right: 0;
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
