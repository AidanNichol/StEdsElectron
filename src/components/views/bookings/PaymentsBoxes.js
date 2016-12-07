import React from 'react';
import {Icon} from '../../../ducks/walksDuck'
import {PaymentHelp} from 'components/help/PaymentHelp';
import {HelpDialog} from 'components/help/HelpDialog';
import TooltipButton from 'components/utility/TooltipButton.js';
import TooltipContent from 'components/utility/TooltipContent.js';
import classNames from 'classnames';
import Select from 'react-select';
import Logit from 'factories/logit.js';
var logit = Logit('color:black; background:yellow;', 'MySelect2');

const OPTIONS = [{type:"P", title:"Paid cash"},
{type:"PX", title:"Refund Payment"},
{type:"T", title:"Paid via Treasurer"},
{type:"TX", title:"Refund via Treasurer"},
{type:"+", title:"Add Credit"},
{type:"+X", title:"Remove Credit"},
];

export const PaymentsBoxes = React.createClass({

  getInitialState () {
    return {paymentType: OPTIONS[0], accId: undefined};
  },
  setValue (paymentType) {
    this.setState({ paymentType });
  },
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
        logit('IconOption', this.props)
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

    const {accId, owing, credit, accountUpdatePayment, changePaymentType, paymentType, setHelp, helpIsOpen} = this.props
    if (!accId) return null
    let handleKeydown = (event)=> {
      logit('keydown', amount, note, event);
      if ( event.which === 13 && amount) {
        event.preventDefault();
        amount = parseInt(amount);
        if (this.state.paymenType.type[1] === 'X')amount = -amount;
        accountUpdatePayment(accId, amount, note, this.state.paymenType.type, amount===owing);
        if (amountTarget)amountTarget.value = ''; if (noteTarget)noteTarget.value='';
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
      <div className="payment" >
        {credit ? <span className="credit">Credit £{credit}</span> : null}
        {/* {(!owing) || setPaymentType[0] != "P" || setPaymentType[1] !== 1 ? null : */}
        {!owing? null :
          <span>
            <TooltipButton lable={`Payment Due £${owing}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/> &nbsp; or
          </span>
        }
        <div className='payment-boxes' >
          <span className="pay-box">
          <Select
          // className="pt-select"
            onChange={changePaymentType}
            optionComponent={IconOption}
            options={OPTIONS}
            clearable={false}
            menuBuffer={800}
            value={this.props.paymentType || OPTIONS[0]}
            valueComponent={IconValue}          />
          <TooltipContent tiptext='Enter paid amount and press enter' visible>
          <span> &nbsp;£ &nbsp;<input size="3" type="text" onKeyDown={handleKeydown} onChange={amountChange}/> </span>
          <span> Note &nbsp; <input size="30" type="text" onKeyDown={handleKeydown} onChange={noteChange}/> &nbsp;</span>
          </TooltipContent>
          <span className="pt-icon-standard pt-icon-help" onClick={()=>setHelp(true)}>&nbsp;</span>
          </span>
          <HelpDialog setHelp={setHelp} isOpen={helpIsOpen}>
            <PaymentHelp />
          </HelpDialog>
        </div>

      </div>
    );

  }
});

// const IconOption = React.createClass({
//   handleMouseDown (event) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.props.onSelect(this.props.option, event);
//   },
//   handleMouseEnter (event) {
//     this.props.onFocus(this.props.option, event);
//   },
//   handleMouseMove (event) {
//     if (this.props.isFocused) return;
//     this.props.onFocus(this.props.option, event);
//   },
//   render () {
//     logit('IconOption', this.props)
//     return (
//       <div className={this.props.className}
//         onMouseDown={(this.props.option.type !== '+X' || credit) && this.handleMouseDown}
//         onMouseEnter={this.handleMouseEnter}
//         onMouseMove={this.handleMouseMove}
//         title={this.props.option.title}>
//         <Icon type={this.props.option.type}/>
//         {this.props.option.title}
//       </div>
//     );
//   }
// });
