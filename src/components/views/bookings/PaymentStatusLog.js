/* jshint quotmark: false */
import React from 'react';
import {Icon} from '../../../ducks/walksDuck'
import classNames from 'classnames';
import TooltipButton from '../../utility/TooltipButton.js';
import TooltipContent from '../../utility/TooltipContent.js';
// import Select from 'react-select';
import Logit from '../../../factories/logit.js';
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

export function payment(props){
  if (!props.accId) return null
  let handleKeydown = (event)=> {
    logit('keydown', amount, note, event);
    if ( event.which === 13 && amount) {
      event.preventDefault();
      props.accountUpdatePayment(props.accId, parseInt(amount), note, bacs, parseInt(amount)===props.owing);
      if (amountTarget)amountTarget.value = ''; if (noteTarget)noteTarget.value='';
    }
  };
  let amount = '', note = '';
  let amountTarget = '', noteTarget = '';
  let amountChange = (event)=> { amount = event.target.value; amountTarget=event.target;};
  let noteChange = (event)=> { note = event.target.value; noteTarget=event.target;};
  let paidInFull = (event)=> {
    props.accountUpdatePayment(props.accId, props.owing, note, bacs, true);
    event.target.value = '';
  };
  let bacs = false;
  let paidByBACS = (event)=> {
    bacs = event.target.value;
  };
  logit('props', props)
  return (
    <div className="payment" >
      {props.credit ? <span className="credit">Credit £{props.credit}</span> : null}
      {!props.owing ? null :
        <span>
          <TooltipButton lable={`Payment Due £${props.owing}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/> &nbsp; or
        </span>
      }
      <TooltipContent className='payment-boxes' tiptext='Enter paid amount and press enter' visible>
        <span className="pay-box">
          bacs <input className="checkbox" type="checkbox" alt="bacs"  onChange={paidByBACS} />
          <span>Pay &nbsp; <input size="3" type="text" onKeyDown={handleKeydown} onChange={amountChange}/> </span>
          <span> Note &nbsp; <input size="21" type="text" onKeyDown={handleKeydown} onChange={noteChange}/> &nbsp;</span>
          {/* <span>&nbsp;</span> */}
        </span>
      </TooltipContent>
    </div>
  );
}
