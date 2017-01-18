/* jshint quotmark: false */
import React from 'react';
import {Panel} from '../utility/AJNPanel'
import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
import classnames from 'classnames';

// import TooltipContent from '../utility/TooltipContent.js';
import PaymentsSummary from './PaymentsSummary'
// import showNewWindow from 'utilities/showNewWindow.js';
import styled from 'styled-components';
import {Icon} from 'ducks/walksDuck'
import {Lock} from 'ducks/lock-duck'
import {observable} from 'mobx'
import {observer} from 'mobx-react'

import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'PaymentsMade:View');

const uiState = observable({
  showAll: false,
  toggleNewBookings: ()=>uiState.showAll = !uiState.showAll
})

const detail =  observer(({bkng, className})=>{
  const cls = {detail: true, [className]: true, newBkng: !bkng.paid}
  return (
  <div className={cls} key={bkng.dat}>
    {bkng.dispDate}
    <Icon type={ bkng.req } width='16' />
    <span className="text">
      { bkng.name && <span className='name'>[{bkng.name}]</span> }
      {bkng.text}
    </span>
    {bkng.paid && <span className="paid">£{bkng.paid}</span>}
  </div>
)});
const Detail = styled(detail)`
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
  min-width: 130px;
  max-width: 130px;
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
`

const memberRecipt = observer((props)=>{

    var {data, showMemberBookings} = props;
    logit('props', props);

    return (
      <div className={props.className+' member-rcpt'}>
        <div className="overview">
          <span className="who" onClick={()=>showMemberBookings(data.accId)}> {data.accName}</span>
          {data.paymentsMade && <TooltipButton className="owed" label={`£${(data.paymentsMade)}`} visible/>}

        </div>
        {data.logs.filter((bkng)=>bkng.paid || (uiState.showAll && bkng.type==='W' && bkng.activeThisPeriod)).map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))}
        {/* {data.logs.filter((bkng)=>bkng.paid || bkng.outstanding).map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))} */}
      </div>
    );
});
const MemberRecipt = styled(memberRecipt)`
  color: #31708f;;
  margin-bottom: 5px;
  margin-right: 5px;
  padding-bottom: 4px;
  border: #bce8f1 thin solid;
  border-radius: 5px;
  width: 310px;
  max-width: 310px;

  span {
    display: inline-block;
  }

  .overview {
    background-color: var(--background-color);
    border-radius: var(--radius);
    border-bottom: var(--border-color) thin solid;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 2px 5px;

    .who {
      width: 200px;
      font-size: 1.1em;
      font-weight: bold;
      padding-right: 5px;
    }

    .owed {
      width: 40px;
      text-align: center;
      font-size: 0.85em;
      padding: 2px;
    }
  }
`

const showRecipts = observer(({accs, showMemberBookings, className})=>{

    const recipts = accs.filter(acc=>uiState.showAll || acc.paymentsMade > 0).map((data) => {return <MemberRecipt data={data} key={data.accId} {...{showMemberBookings}}/>})
    return (<div className={className}>{recipts}</div>)

});
export const ShowRecipts = styled(showRecipts)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  flex: 0 0 315px;
  justify-content: flex-start;
  height: 100%;
`

export const payments = observer((props)=>{

  // const showPaymentSummary = ()=>{showNewWindow('paymentsSummary')}
  logit('payments props', props, uiState);
  var {accs, startDate, totalPaymentsMade, className, showMemberBookings} = props;
  var title = (
    <h4>
      Payments Made &nbsp; &nbsp; &mdash; &nbsp; &nbsp; Total Payments Received
      <span className='startDate' style={{fontSize: '0.8em', fontStyle: 'italic'}}>(since {startDate})</span>:
      &nbsp; £{totalPaymentsMade}
    </h4>);
  return (
    <Panel className={"paymentsMade "+className} header={title} style={{margin:20}} >
      {/* <h4>Total Payments Received <span className='startDate' style={{fontSize: '0.8em', fontStyle: 'italic'}}>(since {startDate})</span>: £{totalPaymentsMade}</h4> */}
      <div className="all-payments">
        <div className="buttons">
          <Lock />
          <TooltipButton label={uiState.showAll ? "Payments" : "All"} onClick={()=>uiState.toggleNewBookings()} tiptext={uiState.showAll ? 'Only show new payments' : 'Show all changes this period'} visible/>
          <MyModal icon="bank"  tiptext='View payments summary'>
            <PaymentsSummary />
          </MyModal>

        </div>
        <ShowRecipts {...{accs, showMemberBookings}}/>

      </div>
    </Panel>
    )

});

const Payments = styled(payments)`

  border: #bce8f1 solid thin;
  border-collapse: collapse;
  width: 100%;

  span {
    display: inline-block;
  }

  /*.overview {
    .walk-detail {
      width: 180px;
      padding-right: 5px;
    }
  }

  .reciptsContainer,
  .all-debts {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    height: 100%;
  }*/

  .all-payments {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    height: 100%;

    .buttons {
      display: flex;
      flex-direction: column;
      padding-bottom: 4px;
      max-width: 280px;
    }
  }


  }

  /*.overview,*/
  /*.header {
    background-color: var(--background-color);
    border-radius: var(--radius);
    border-bottom: var(--border-color) thin solid;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 2px 5px;

    .who {
      width: 200px;
      font-size: 1.1em;
      font-weight: bold;
      padding-right: 5px;
    }

    .owed {
      width: 60px;
      text-align: center;
    }

    .paid {
      width: 60px;
      text-align: center;
      margin-left: 20px;

      input {
        width: 40px;
        font-size: 0.85em;
      }
    }
  }

  .header {
    width: 33%;

    span {
      font-size: 1.1em;
      font-weight: bold;
    }
  }*/

  /*.debtor {
    color: var(--header-text-color);
    margin-bottom: 5px;
    margin-right: 5px;
    padding-bottom: 4px;
    border: var(--border-color) thin solid;
    border-radius: var(--radius);
    width: 310px;
    max-width: 310px;

    .owed {
      font-size: 0.85em;
      padding: 2px;
    }
  }*/
`;

export default Payments;
