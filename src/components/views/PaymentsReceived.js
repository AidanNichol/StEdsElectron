/* jshint quotmark: false */
import React from 'react';
import { Panel } from '../utility/AJNPanel';
// import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
import classnames from 'classnames';
import { paymentsSummaryReport3 } from '../../reports/paymentsSummaryReport3';
import { PrintButton } from '../utility/PrintButton';
// import TooltipContent from '../utility/TooltipContent.js';
// import PaymentsSummary from './PaymentsSummary'
// import showNewWindow from 'utilities/showNewWindow.js';
import styled from 'styled-components';
import { Icon } from '../utility/Icon';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import Logit from 'logit';
var logit = Logit(__filename);

const uiState = observable({
  showAll: true,
  toggleNewBookings: () => (uiState.showAll = !uiState.showAll),
});

const detail = observer(({ bkng, className }) => {
  const cls = classnames({
    detail: true,
    [className]: true,
    newBkng: bkng.activeThisPeriod && !(bkng.paid && bkng.paid.P > 0),
  });
  const paid = [['+', '₢'], ['T', '₸'], ['P', '£']].map(([code, txt]) => {
    return bkng.paid && bkng.paid[code] ? (
      <span className={'paid-' + code} key={code}>
        &nbsp;{txt + bkng.paid[code]}
      </span>
    ) : null;
  });
  return (
    <div className={cls} key={bkng.dat}>
      {bkng.dispDate}
      <Icon type={bkng.req} width="16" />
      <span className="text">
        {bkng.name && <span className="name">[{bkng.name}]</span>}
        {bkng.text}
      </span>
      <span className="paid">{paid}</span>
    </div>
  );
});
export const Detail = styled(detail)`
  position: relative;
  padding-left: 3px;
  padding-bottom: 0px;
  margin-bottom: 0px;
  /*padding-left: 3px;*/

  span {
    display: inline-block;
  }

  .paid-C {
    color: brown;
  }

  .paid {
    margin: 2px;
  }
  .paid-T {
    color: blue;
  }
  .text {
    display: inline-block;
    position: relative;
    top: 5px;
    min-width: 115px;
    max-width: 115px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &.newBkng {
    background-color: rgb(233, 251, 239);
  }

  .name {
    font-size: 0.9em;
    font-style: italic;
  }
`;

const memberRecipt = observer(props => {
  var { data, showMemberBookings } = props;
  logit('props', data.accName, props);

  return (
    <div className={props.className + ' member-rcpt'}>
      <div className="overview">
        <span className="who" onClick={() => showMemberBookings(data.accId)}>
          {' '}
          {data.accName}
        </span>
        {data.paymentsMade !== 0 ? (
          <TooltipButton className="owed" label={`£${data.paymentsMade}`} visible />
        ) : null}
      </div>
      {data.logs
        .filter(bkng => bkng.type === 'W' && bkng.activeThisPeriod)
        .filter(bkng => (bkng.paid && bkng.paid.P > 0) || uiState.showAll)
        .map(bkng => {
          if (bkng.accId === 'A2015')
            logit(
              'A2105',
              bkng.text,
              bkng.paid,
              uiState.showAll,
              bkng.paid && bkng.paid.P > 0,
            );
          return bkng;
        })
        .map(bkng => (
          <Detail bkng={bkng} key={bkng.dat + 'xx'} />
        ))}
      {/* {data.logs.filter((bkng)=>bkng.paid || bkng.outstanding).map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))} */}
    </div>
  );
});
export const MemberRecipt = styled(memberRecipt)`
  color: #31708f;
  margin-bottom: 5px;
  margin-right: 5px;
  padding-bottom: 4px;
  border: #bce8f1 thin solid;
  border-radius: 5px;
  flex: 0 0 auto;
  /*max-width: 300px;*/

  span {
    display: inline-block;
  }

  .overview {
    background-color: #d9edf7;
    border-radius: 5px;
    border-bottom: #bce8f1 thin solid;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 2px 5px;
    display: flex;
    justify-content: space-between;
    width: 243px;

    .who {
      /* width: 190px; */
      font-size: 1.1em;
      font-weight: bold;
      padding-right: 5px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-basis: 1 1 190px;
    }

    .owed {
      /* width: 40px; */
      text-align: center;
      font-size: 0.85em;
      padding: 2px;
      flex-basis: 0 0 40px;
    }
  }
`;

export const payments = observer(props => {
  var {
    accs,
    startDate,
    totalPaymentsMade,
    showPaymentsDue,
    className,
    showMemberBookings,
    bankMoney,
    doc,
    lastWalk,
  } = props;
  logit('accs', accs);

  var title = (
    <h4>
      Payments Made &nbsp; &nbsp; — &nbsp; &nbsp; Total Payments Received
      <span className="startDate" style={{ fontSize: '0.8em', fontStyle: 'italic' }}>
        (since {startDate})
      </span>
      : &nbsp; £{totalPaymentsMade}
    </h4>
  );
  return (
    <Panel className={'paymentsMade ' + className} header={title}>
      <div className="all-payments">
        <div className="buttons">
          <TooltipButton
            label="Show Payments Due"
            onClick={showPaymentsDue}
            tiptext="Show Payments Due"
            className="tab-select"
            visible
          />
          <TooltipButton
            label={uiState.showAll ? 'Only Payments' : 'All Changes'}
            onClick={uiState.toggleNewBookings}
            placement="bottom"
            tiptext={
              uiState.showAll ? 'Only show new payments' : 'Show all changes this period'
            }
            className="show-range"
            visible
          />
          <PrintButton
            placement="bottom"
            onClick={() => paymentsSummaryReport3(doc, lastWalk)}
            tiptext="Print Summary Report"
            visible
          />
          <TooltipButton
            icon="bank"
            placement="bottom"
            onClick={() => {
              paymentsSummaryReport3(doc, lastWalk);
              bankMoney(doc);
            }}
            tiptext="Bank the money and start new period"
            visible
          />
        </div>
        {accs
          .filter(
            acc => acc.activeThisPeriod && (uiState.showAll || acc.paymentsMade !== 0),
          )
          .map(data => {
            return (
              <MemberRecipt data={data} key={data.accId} {...{ showMemberBookings }} />
            );
          })}
      </div>
    </Panel>
  );
});

const Payments = styled(payments)`
  border: #bce8f1 solid thin;
  border-collapse: collapse;
  width: 100%;

  .panel-header {
    margin-bottom: 5px;
  }

  span {
    display: inline-block;
  }

  .range,
  .swap-mode {
    font-size: 0.9em;
    max-width: 73px;
    padding: 2px 4px;
  }

  .swap-mode {
    background-color: rgb(186, 231, 245);
  }

  .all-payments {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    height: 100%;
    flex: 0 0 300px;
    min-width: 0;
    overflow: scroll;

    .buttons {
      display: flex;
      flex-direction: row;
      padding-bottom: 4px;
      align-items: center;
      justify-content: space-between;
      width: 250px;

      .show-range {
        background-color: rgb(184, 226, 247);
      }

      .button {
        max-width: 75px;
        font-size: 0.85em;
      }
    }
  }
`;

export default Payments;
