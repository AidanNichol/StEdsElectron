/* jshint quotmark: false */
import React from 'react';
import {findDOMNode} from 'react-dom';
import {Icon} from 'ducks/walksDuck'
// import {PaymentHelp} from 'components/help/PaymentHelp';
// import {HelpDialog} from 'components/help/HelpDialog';
import classNames from 'classnames';
// import TooltipButton from 'components/utility/TooltipButton.js';
// import TooltipContent from 'components/utility/TooltipContent.js';

// import Select from 'react-select';
import Logit from 'factories/logit.js';
var logit = Logit('color:black; background:yellow;', 'ChangeLog');

const EditButton = ({startDate, accountDeletePayment, resetLateCancellation, accId, log})=>{
  if (log.dat < startDate) return null;
  if (log.type==='W' && log.req === 'BL'){
    return (<span onClick={()=>resetLateCancellation(log.walkId, log.memId)} className="edit_button">
      <Icon type="BL" />&rArr; <Icon type="BX" />
    </span>)
  }
  if (log.type==="A" && log.req!=="A"){
    return (<span onClick={()=>accountDeletePayment(accId, log.dat)}  className="edit_button" style={{paddingLeft: "1em"}}>
      <Icon type="Cancel" />
    </span>)
  }
  return null;
}

class TheTable extends React.Component {
  componentWillUpdate() {
    var node = findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    // if (this.shouldScrollBottom) {
      var node = findDOMNode(this);
      logit('componentDidUpdate', node)
      node.scrollTop = node.scrollHeight
    // }
  }
  render() {
    const {logs=[], ...rest} = this.props;
    logit("TheTable", {logs, rest, props:this.props})
    return (
    <div style={{overflow: 'auto', maxHeight: 500}}>
      {
        logs.map((log, i)=>{
          let rCl = classNames({logData: true, logRec: true, outstanding: log.outstanding, historic: log.historic, inbalance: log.balance===0});
          let aCl = classNames({logData: true, logAmount: true, logPay: log.req==='P', fee: log.req!=='P' && log.amount<0, credit: log.amount>0});
          let bCl = classNames({logData: true, logBal: true, credit: log.balance>0, owing: log.balance<0});
          return (<div key={i} className={rCl}>
            <span className="logDate">{log.dispDate}</span>
            <Icon type={log.req} />
            <span className="logText">
              {log.type !== 'A' && log.name && (<span className="name">[{log.name}] </span>) }
              <span className="text">{log.text}</span>
            </span>
            <span className={aCl}>{log.amount > 0 ? log.amount : ''}</span>
            <span className={aCl}>{log.amount <0 ? -log.amount : ''}</span>
            <span className={bCl}>{log.balance}</span>{log.paid ? 'P' : ''}
            <EditButton log = {log} {...rest}/>
          </div>)
        })
      }
    </div>)

  }
}

export function changeLog(props) {
  if (!props.accId) return null

  logit('props', props)

  return (
    <div className={"logsTable "+(props.className || '')}>
      <div className="logHeader">
        <span className="logDate">Date</span>
        <Icon type='Blank' style={{opacity:0, }} />
        <span className="logText">Event</span>
        <span style={{width: 8, display: 'inline-block'}}>&nbsp;</span>
        <span className="logAmount">Exp.</span>
        <span className="logAmount">Inc.</span>
        <span className="logBal">Balance</span>
      </div>
      <TheTable {...props} />
    </div>
  );
}
