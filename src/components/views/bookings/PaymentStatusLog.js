/* jshint quotmark: false */
import React from 'react';
import {Icon} from '../../../ducks/walksDuck'
import classNames from 'classnames';
// import {Button} from 'react-bootstrap';
import TooltipButton from '../../utility/TooltipButton.js';
import TooltipContent from '../../utility/TooltipContent.js';

// import Select from 'react-select';
import Logit from '../../../factories/logit.js';
var logit = Logit('color:black; background:yellow;', 'ChangeLog');
export default function ChangeLog(props) {

  if (!props.accId) return null
  let handleKeydown = (event)=> {
    logit('keydown', amount, note, event);
    if ( event.which === 13 && amount) {
      event.preventDefault();
      props.accountUpdatePayment(props.accId, parseInt(amount), note);
      if (amountTarget)amountTarget.value = ''; if (noteTarget)noteTarget.value='';
    }
  };
  // let handleKeydown = (event)=> {
  //   var amount = parseInt(event.target.value);
  //   logit('keydown', amount, event.which, event);
  //   if ( event.which === 13 && amount) {
  //     event.preventDefault();
  //     props.accountUpdatePayment(props.accId, amount);
  //     event.target.value = '';
  //   }
  // };
  let amount = '', note = '';
  let amountTarget = '', noteTarget = '';
  let amountChange = (event)=> { amount = event.target.value; amountTarget=event.target;};
  let noteChange = (event)=> { note = event.target.value; noteTarget=event.target;};
  let paidInFull = (event)=> {
    props.accountUpdatePayment(props.accId, props.owing);
    event.target.value = '';
  };
  logit('props', props)
  return (
    <div className="payments">
      <link rel="stylesheet" href="less/logsTable.less" />;
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
              <span className="logText"><Icon type={log.req} /> {log.text}</span>
              <span className={aCl}>{log.amount > 0 ? log.amount : ''}</span>
              <span className={aCl}>{log.amount <0 ? -log.amount : ''}</span>
              <span className={bCl}>{log.balance}</span>
            </div>)
          })
        }
      </div>
      <div className="payment" >
        {props.credit ? <span className="credit">Credit £{props.credit}</span> : null}
        {!props.owing ? null :
          <span>
            <TooltipButton lable={`Payment Due £${props.owing}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/> &nbsp; or
          </span>
        }
        <TooltipContent tiptext='Enter paid amount and press enter' visible>
        <span className="pay-box">
          <span>Pay &nbsp; <input type="text" onKeyDown={handleKeydown} onChange={amountChange}/> </span>
          <span> Note &nbsp; <input type="text" onKeyDown={handleKeydown} onChange={noteChange}/> </span>
        </span>
        </TooltipContent>
      </div>
    </div>
  );
}
