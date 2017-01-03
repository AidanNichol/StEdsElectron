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
    return (
    <div style={{overflow: 'auto', maxHeight: 500}}>
      {
        (this.props.logs||[]).map((log, i)=>{
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
            <span className={bCl}>{log.balance}</span>
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
    <div className="logsTable">
      <div className="logHeader">
        <span className="logDate">Date</span>
        <span className="logText">Event</span>
        <span className="logAmount">Exp.</span>
        <span className="logAmount">Inc.</span>
        <span className="logBal">Balance</span>
      </div>
      <TheTable logs={props.logs} />
      {/* <div style={{overflow: 'auto', maxHeight: 500}}>
      {
        (props.logs||[]).map((log, i)=>{
          let rCl = classNames({logData: true, logRec: true, outstanding: log.outstanding, historic: log.historic});
          let aCl = classNames({logData: true, logAmount: true, logPay: log.req==='P', fee: log.req!=='P' && log.amount<0, credit: log.amount>0});
          let bCl = classNames({logData: true, logBal: true, credit: log.balance>0, owing: log.balance<0,inbalance: log.balance===0});
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
      </div> */}
    </div>
  );
}
