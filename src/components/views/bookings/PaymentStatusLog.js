/* jshint quotmark: false */
import React from 'react';
import {Icon} from 'ducks/walksDuck'
// import {PaymentHelp} from 'components/help/PaymentHelp';
// import {HelpDialog} from 'components/help/HelpDialog';
import classNames from 'classnames';
// import TooltipButton from 'components/utility/TooltipButton.js';
// import TooltipContent from 'components/utility/TooltipContent.js';

// import Select from 'react-select';
import Logit from 'factories/logit.js';
var logit = Logit('color:black; background:yellow;', 'ChangeLog');
export function changeLog(props) {

  if (!props.accId) return null

  logit('props', props)

  return (
    <div className="logsTable">
      <div className="logHeader">
        <span className="logDate">Date</span>
        <span className="logText">Event</span>
        <span className="logAmount">Exp.</span>
        <span className="logAmount">Inc.</span>
        <span className="logBal">Balance</span>
      </div>
      {
        (props.logs||[]).map((log, i)=>{
          let rCl = classNames({logData: true, logRec: true, outstanding: log.outstanding, historic: log.historic});
          let aCl = classNames({logData: true, logAmount: true, logPay: log.req==='P', fee: log.req!=='P' && log.amount<0, credit: log.amount>0});
          let bCl = classNames({logData: true, logBal: true, credit: log.balance>0, owing: log.balance<0});
          return (<div key={i} className={rCl}>
            <span className="logDate">{log.dispDate}</span>
            <span className="logText">
              <Icon type={log.req} />
              {log.req !== 'P' && log.name && (<span className="name">[{log.name}] </span>) }
              <span className="text">{log.text}</span>
            </span>
            <span className={aCl}>{log.amount > 0 ? log.amount : ''}</span>
            <span className={aCl}>{log.amount <0 ? -log.amount : ''}</span>
            <span className={bCl}>{log.balance}</span>
            </div>)
          })
        }
    </div>
  );
}


// export function payment(props){
//   if (!props.accId) return null
//   let handleKeydown = (event)=> {
//     logit('keydown', amount, note, event);
//     if ( event.which === 13 && amount) {
//       event.preventDefault();
//       amount = parseInt(amount);
//       if (paymentType[1] === 'X')amount = -amount;
//       props.accountUpdatePayment(props.accId, amount, note, paymentType, amount===props.owing);
//       if (amountTarget)amountTarget.value = ''; if (noteTarget)noteTarget.value='';
//     }
//   };
//   let amount = '', note = '';
//   let amountTarget = '', noteTarget = '';
//   let amountChange = (event)=> { amount = event.target.value; amountTarget=event.target;};
//   let noteChange = (event)=> { note = event.target.value; noteTarget=event.target;};
//   let paidInFull = (event)=> {
//     props.accountUpdatePayment(props.accId, props.owing, note, 'P', true);
//     event.target.value = '';
//   };
//
//   const MySelect = ()=>(<div className="pt-select">
//       <select onChange={setPaymentType} defaultValue="P" >
//         <option value="P">Paid cash</option>
//         <option value="PX">Refund Payment</option>
//         <option value="T">Paid via Treasurer</option>
//         <option value="TX">Refund via Treasurer</option>
//         <option value="+">Add Credit</option>
//         <option value="+X" disabled={!props.credit}>Remove Credit</option>
//       </select>
//     </div>)
//
//
//
//   var paymentType = 'P';
//   let setPaymentType = (event)=> {
//     paymentType = event.target.value;
//     logit('paymentType', paymentType)
//   };
//   logit('props', {props, paymentType})
//   return (
//     <div className="payment" >
//       {props.credit ? <span className="credit">Credit £{props.credit}</span> : null}
//       {/* {(!props.owing) || setPaymentType[0] != "P" || setPaymentType[1] !== 1 ? null : */}
//       {!props.owing? null :
//         <span>
//           <TooltipButton lable={`Payment Due £${props.owing}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/> &nbsp; or
//         </span>
//       }
//       <div className='payment-boxes' >
//         <span className="pay-box">
//         <MySelect />
//         <TooltipContent tiptext='Enter paid amount and press enter' visible>
//         <span> &nbsp;£ &nbsp;<input size="3" type="text" onKeyDown={handleKeydown} onChange={amountChange}/> </span>
//         <span> Note &nbsp; <input size="30" type="text" onKeyDown={handleKeydown} onChange={noteChange}/> &nbsp;</span>
//         </TooltipContent>
//         <span className="pt-icon-standard pt-icon-help" onClick={()=>props.setHelp(true)}>&nbsp;</span>
//         </span>
//         <HelpDialog setHelp={props.setHelp} isOpen={props.helpIsOpen}>
//           <PaymentHelp />
//         </HelpDialog>
//       </div>
//
//     </div>
//   );
// }
