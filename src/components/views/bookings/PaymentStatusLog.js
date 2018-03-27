/* jshint quotmark: false */
import React from 'react';
import { findDOMNode } from 'react-dom';
import { Icon } from 'components/utility/Icon';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

// import Select from 'react-select';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);

const EditButton = ({
  startDate,
  accountDeletePayment,
  resetLateCancellation,
  accId,
  log,
}) => {
  if (log.dat < startDate) return null;
  if (log.type === 'W' && log.req === 'BL') {
    return (
      <span
        onClick={() => resetLateCancellation(log.walkId, log.memId)}
        className="edit_button"
      >
        <Icon type="BL" />&rArr; <Icon type="BX" />
      </span>
    );
  }
  if (log.type === 'A' && log.req !== 'A') {
    return (
      <span
        onClick={() => accountDeletePayment(accId, log.dat)}
        className="edit_button"
        style={{ paddingLeft: '1em' }}
      >
        <Icon type="Cancel" />
      </span>
    );
  }
  return null;
};

class TheTable extends React.Component {
  componentDidMount() {
    var node = findDOMNode(this);
    logit('componentDidMount', node.scrollHeight);
    node.scrollTop = node.scrollHeight + 1000;
    // this.setState({dummy:'dummy'});
  }

  componentWillUpdate() {
    var node = findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    // if (this.shouldScrollBottom) {
    var node = findDOMNode(this);
    logit('componentDidUpdate', node.scrollHeight);
    node.scrollTop = node.scrollHeight;
    // }
  }
  render() {
    const { logs = [], showAll, ...rest } = this.props;
    logit('TheTable', { logs, rest, props: this.props });
    return (
      <div className="scrollBox">
        {logs.filter(log => showAll || !log.hideable).map((log, i) => {
          let rCl = classNames({
            logData: true,
            logRec: true,
            outstanding: log.outstanding,
            historic: log.historic,
            inbalance: log.balance === 0,
          });
          let aCl = classNames({
            logData: true,
            logAmount: true,
            logPay: log.req === 'P',
            fee: log.req !== 'P' && log.amount < 0,
            credit: log.amount > 0,
          });
          let bCl = classNames({
            logData: true,
            logBal: true,
            credit: log.balance > 0,
            owing: log.balance < 0,
          });
          return (
            <div key={i} className={rCl}>
              <span className="logDate">{log.dispDate}</span>
              <Icon type={log.req} />
              <span className="logText">
                {log.type !== 'A' &&
                  log.name && <span className="name">[{log.name}] </span>}
                <span className="text">{log.text}</span>
              </span>
              <span className={aCl}>{log.amount > 0 ? log.amount : ''}</span>
              <span className={aCl}>{log.amount < 0 ? -log.amount : ''}</span>
              <span className={bCl}>{log.balance}</span>
              <EditButton log={log} {...rest} />
            </div>
          );
        })}
      </div>
    );
  }
}

export function changeLog(props) {
  if (!props.accId) return null;

  logit('props', props);
  let _logtable = null;
  const requestPrint = () => {
    logit('requestPrint', _logtable);
    ipcRenderer.send('printPDF', { content: _logtable, name: 'paymentsLog' });
  };
  return (
    <div
      className={'logsTable ' + (props.className || '')}
      ref={el => {
        _logtable = el ? el.outerHTML : '';
        logit('ref', _logtable);
      }}
    >
      <div className="logHeader">
        <span className="logDate">Date</span>
        <Icon type="Blank" style={{ opacity: 0 }} />
        <span className="logText">Event</span>
        <span style={{ width: 8, display: 'inline-block' }}>&nbsp;</span>
        <span className="logAmount">Exp.</span>
        <span className="logAmount">Inc.</span>
        <span className="logBal">Balance</span>
        <span onClick={props.toggleShowAll} className="showAll screenOnly">
          {props.showAll ? '🔽' : '▶️'}
        </span>
        <span onClick={requestPrint} className="print screenOnly">
          '🖨'
        </span>
      </div>
      <TheTable {...props} />
    </div>
  );
}
