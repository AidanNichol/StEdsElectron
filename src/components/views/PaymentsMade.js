/* jshint quotmark: false */
import React from 'react';
import {Panel} from '../utility/AJNPanel'
import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
// import TooltipContent from '../utility/TooltipContent.js';
import PaymentsSummary from './PaymentsSummary'
// import showNewWindow from 'utilities/showNewWindow.js';
import styled from 'styled-components';
import {Icon} from 'ducks/walksDuck'
import {Lock} from 'ducks/lock-duck'
import {observer} from 'mobx-react'

import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'PaymentsMade:View');


const detail =  ({bkng, className})=>(
  <div className={className} key={bkng.dat}>
    {bkng.dispDate}
    <Icon type={ bkng.req } width='16' />
    <span className="text">
      { bkng.name && <span className='name'>[{bkng.name}]</span> }
      {bkng.text}
    </span>
    <span className="paid">£{bkng.paid}</span>
  </div>
)
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
      <div className={props.className}>
        <div className="overview">
          <span className="who" onClick={()=>showMemberBookings(data.accId)}> {data.accName}</span>
          <TooltipButton className="owed" label={`£${(data.paymentsMade)}`} visible/>
          {props.enterPayment || null}
        </div>
        {data.logs.filter((bkng)=>bkng.paid).map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))}
        {/* {data.logs.filter((bkng)=>bkng.paid || bkng.outstanding).map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))} */}
      </div>
    );
});

const showRecipts = observer(({logs, showMemberBookings, className})=>{

    const recipts = logs.map((data) => {return <MemberRecipt data={data} key={data.accId} {...{showMemberBookings}}/>})
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

export const Payments = observer((props)=>{

  // const showPaymentSummary = ()=>{showNewWindow('paymentsSummary')}
  logit('payments props', props);
  var {logs, showMemberBookings} = props;
  var title = (<h4>Payments Made</h4>);
  return (
    <Panel className="payments" header={title} style={{margin:20}} >
      <div className="all-payments">
        <div className="buttons">
          <Lock />
          {/* <TooltipButton label="Summary" onClick={()=>{showSummary=true; logit('showSummary', showSummary)}} tiptext='Show Payment Summary' visible/> */}
          <MyModal icon="bank"  tiptext='View payments summary'>
            <PaymentsSummary />
          </MyModal>

        </div>
        <ShowRecipts {...{logs, showMemberBookings}}/>

      </div>
    </Panel>
  )

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
export default Payments;
