/* jshint quotmark: false */
import React from 'react';
import { Panel } from '../utility/AJNPanel';
import TooltipButton from '../utility/TooltipButton.js';
import classnames from 'classnames';

import styled from 'styled-components';
import { Icon } from '../utility/Icon';
// import {Icon} from 'ducks/walksDuck'
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import Logit from 'logit';
var logit = Logit(__filename);

const uiState = observable({
  showAll: false,
  toggleNewBookings: () => (uiState.showAll = !uiState.showAll),
});

const detail = observer(({ bkng, className }) => {
  const cls = classnames({
    detail: true,
    [className]: true,
    newBkng: !bkng.owing,
  });
  return (
    <div className={cls} key={bkng.dat}>
      {bkng.dispDate}
      <Icon type={bkng.req} width="16" />
      <span className="text">
        {bkng.name && <span className="name">[{bkng.name}]</span>}
        {bkng.text}
      </span>
      {bkng.paid && <span className="paid">£{bkng.owing}</span>}
    </div>
  );
});

export const Detail = styled(detail)`
  position: relative;
  padding-left: 3px;
  /*padding-left: 3px;*/

  span {
    display: inline-block;
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

    &.newBkng {
      background-color: rgb(171, 206, 232);
    }
  }

  .name {
    font-size: 0.9em;
    font-style: italic;
  }
`;

const memberRecipt = observer(props => {
  var { data, showMemberBookings } = props;
  logit('props', props);

  return (
    <div className={props.className + ' member-rcpt'}>
      <div className="overview">
        <span className="who" onClick={() => showMemberBookings(data.accId)}>
          {' '}
          {data.accName}
        </span>
        <span className="owed">{`£${-data.balance}`}</span>
      </div>
      {data.logs
        .filter(bkng => bkng.outstanding && bkng.amount !== 0)
        .map(bkng => (
          <Detail bkng={bkng} key={bkng.dat + 'xx'} />
        ))}
    </div>
  );
});
export const MemberRecipt = styled(memberRecipt)`
  color: #31708f;
  margin-bottom: 3px;
  margin-right: 3px;
  padding-bottom: 4px;
  border: #bce8f1 thin solid;
  border-radius: 5px;
  width: 245px;
  flex: 0 0 auto;

  span {
    display: inline-block;
  }

  .overview {
    background-color: #d9edf7;
    border-radius: 5px;
    border-bottom: #bce8f1 thin solid;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 1px 3px;
    display: flex;
    justify-content: space-between;

    .who {
      width: 190px;
      font-size: 1.1em;
      font-weight: bold;
      padding-right: 5px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .owed {
      width: 40px;
      text-align: center;
      font-size: 0.85em;
      padding: 2px;
      color: #333;
      background-color: #e6e6e6;
      border: 1px solid #adadad;
      border-radius: 4px;
    }
  }
`;

export const payments = observer(props => {
  logit('payments props', props, uiState);
  var {
    accs,
    showPaymentsMade,
    className,
    showMemberBookings,
    accountUpdatePayment,
  } = props;
  var title = <h4> Payments Due </h4>;
  return (
    <Panel className={'paymentsDue ' + className} header={title}>
      <div className="all-payments">
        <div className="buttons">
          <TooltipButton
            label="Show Payments Made"
            onClick={showPaymentsMade}
            tiptext="Show Payments Made"
            visible
          />
        </div>
        {accs
          .filter(acc => acc.balance < 0)
          .map(data => {
            return (
              <MemberRecipt
                data={data}
                key={data.accId}
                {...{ showMemberBookings, accountUpdatePayment }}
              />
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
  height: 100%;

  span {
    display: inline-block;
  }

  .swap-mode {
    font-size: 0.9em;
    max-width: 73px;
    padding: 2px 4px;
    background-color: rgb(186, 231, 245);
  }

  .all-payments {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    width: auto;
    justify-content: flex-start;
    height: 100%;
    flex: 0 0 300px;
    min-width: 0;
    overflow: scroll;

    .buttons {
      display: flex;
      flex-direction: row;
      padding-bottom: 4px;
      /*max-width: 280px;*/
    }

    .button {
      max-width: 75px;
      font-size: 0.85em;
    }
  }
`;

export default Payments;
