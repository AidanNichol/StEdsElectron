/* jshint quotmark: false */
import React from 'react';
import { findDOMNode } from 'react-dom';
import { Icon } from '../../utility/Icon';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

import Logit from 'logit';
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
        <Icon type="BL" /> &rArr; <Icon type="BX" />
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
    const { logs, showAll, ...rest } = this.props;
    logit('TheTable', { logs, rest, props: this.props });
    return (
      <div className="scrollBox">
        {logs
          .filter(log => (showAll || !log.hideable) && log.req[0] !== '_')
          .map((log, i) => {
            let rCl = classNames({
              logData: true,
              logRec: true,
              outstanding: log.outstanding,
              historic: log.historic || log.hideable,
              inbalance: !log.restartPoint && log.balance === 0,
              cleared: log.restartPoint,
            });
            let aCl = classNames({
              logData: true,
              logAmount: true,
              logPay: log.req === 'P',
              fee: log.req !== 'P' && log.amount < 0,
              credit: log.amount > 0 && log.req !== 'A',
            });
            let bCl = classNames({
              logData: true,
              logBal: true,
              credit: log.balance > 0 && log.req[0] !== 'W',
              owing: log.balance < 0,
            });
            return (
              <div key={i} className={rCl}>
                <span className="logDate">
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                    }}
                  >
                    {log.outOfSequence ? (
                      <img
                        src="../assets/long-arrow-down.svg"
                        style={{ width: 12, paddingRight: 2 }}
                      />
                    ) : (
                      <> </>
                    )}
                  </span>
                  {log.dispDate}
                </span>
                <Icon type={log.req} />
                <span className="logText">
                  {log.type !== 'A' && log.name && (
                    <span className="name">{log.name} </span>
                  )}
                  <span className="text" title={log.type === 'W' ? log.walkId : ''}>
                    {log.text}
                  </span>
                </span>
                <span className={aCl}>{log.amount > 0 ? log.amount : ''}</span>
                <span className={aCl}>{log.amount < 0 ? -log.amount : ''}</span>
                <span className={bCl}>
                  {/^[BC]/.test(log.req) || log.type === 'A' ? log.balance : ''}
                </span>
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
      // ref={el => {
      //   _logtable = el ? el.outerHTML : '';
      // }}
    >
      <span className="showMode screenOnly">
        <span
          onClick={() => props.changeMode(1)}
          className={props.showMode === 1 ? 'active' : ''}
        >
          Old
        </span>
        <span
          onClick={() => props.changeMode(2)}
          className={props.showMode === 2 ? 'active' : ''}
        >
          New
        </span>
        <span
          onClick={() => props.changeMode(3)}
          className={props.showMode === 3 ? 'active' : ''}
        >
          Future
        </span>
      </span>

      <div className="logHeader">
        <span className="logDate">Date</span>
        <Icon type="Blank" style={{ opacity: 0 }} />
        <span className="logText">Event</span>
        <span style={{ width: 8, display: 'inline-block' }}>&nbsp;</span>
        <span className="logAmount">Exp.</span>
        <span className="logAmount">Inc.</span>
        <span className="logBal">Balance</span>
        <span onClick={props.toggleShowAll} className="showAll screenOnly">
          {props.showAll ? '🔽' : '▶️️'}
        </span>
        <span onClick={requestPrint} className="showAll print screenOnly">
          🖨
        </span>
      </div>
      <TheTable {...props} />
    </div>
  );
}
