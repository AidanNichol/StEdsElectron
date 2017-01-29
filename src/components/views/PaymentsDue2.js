/* jshint quotmark: false */
import React from 'react';
import {Panel} from '../utility/AJNPanel'
// import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
import classnames from 'classnames';

import TooltipContent from '../utility/TooltipContent.js';
// import PaymentsSummary from './PaymentsSummary'
// import showNewWindow from 'utilities/showNewWindow.js';
import styled from 'styled-components';
import {Icon} from 'ducks/walksDuck'
import {Lock} from 'ducks/lock-duck'
import {observable} from 'mobx'
import {observer} from 'mobx-react'

import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'PaymentsDue:View');

const uiState = observable({
  showAll: false,
  toggleNewBookings: ()=>uiState.showAll = !uiState.showAll
})

const enterPayment = ({accId, accountUpdatePayment, due, className})=>{
  let handleKeydown = (event)=> {
    var amount = parseInt(event.target.value);
    if ( event.which === 13 && amount > 0) {
      event.preventDefault();
      accountUpdatePayment(accId, amount, amount === due);
      event.target.value = '';
    }
  };
  return (<TooltipContent tiptext='Enter paid amount and press enter' className={className} visible>
    <span className="paid">£<input type="text" onKeyDown={handleKeydown} /></span>
  </TooltipContent>);
}
const EnterPayment = styled(enterPayment)`
    .paid {
      /*width: 50px;*/
      text-align: center;
      margin-left: 10px;

      input {
        width: 30px;
        font-size: 0.85em;
      }
    }`


const detail =  observer(({bkng, className})=>{
  const cls = classnames({detail: true, [className]: true, newBkng: !bkng.owing})
  return (
  <div className={cls} key={bkng.dat}>
    {bkng.dispDate}
    <Icon type={ bkng.req } width='16' />
    <span className="text">
      { bkng.name && <span className='name'>[{bkng.name}]</span> }
      {bkng.text}
    </span>
    {bkng.paid && <span className="paid">£{bkng.owing}</span>}
  </div>
)});

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
`;

const memberRecipt = observer((props)=>{

  var {data, showMemberBookings, accountUpdatePayment} = props;
  logit('props', props);

  let paidInFull = (event)=> {
    accountUpdatePayment(data.accId, -data.balance, true);
    event.target.value = '';
  };

  return (
    <div className={props.className+' member-rcpt'}>
      <div className="overview">
        <span className="who" onClick={()=>showMemberBookings(data.accId)}> {data.accName}</span>
        <TooltipButton className="owed" label={`£${(-data.balance)}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/>
        {/* <TooltipButton className="owed" label={`£${-data.balance}`} visible/>} */}
        <EnterPayment {...{accountUpdatePayment, accId: data.accId, due: -data.balance}} />
        {/* {enterPayment({accountUpdatePayment, accId: data.accId})} */}
      </div>
      {data.logs.filter((bkng)=>bkng.outstanding).map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))}
      {/* {data.logs.filter((bkng)=>bkng.paid || bkng.outstanding).map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))} */}
    </div>
  );
});
export const MemberRecipt = styled(memberRecipt)`
  color: #31708f;;
  margin-bottom: 5px;
  margin-right: 5px;
  padding-bottom: 4px;
  border: #bce8f1 thin solid;
  border-radius: 5px;
  width: 300px;
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
    padding: 2px 5px;

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
    }
  }
`

export const payments = observer((props)=>{

  // const showPaymentSummary = ()=>{showNewWindow('paymentsSummary')}
  logit('payments props', props, uiState);
  var {accs,  showPaymentsMade, className, showMemberBookings, accountUpdatePayment} = props;
  var title = ( <h4> Payments Due </h4>);
  return (
    <Panel className={"paymentsDue "+className} header={title} style={{margin:20}} >
      <div className="all-payments">
        <div className="buttons">
          <Lock />
          {/* <TooltipButton label={uiState.showAll ? "Payments" : "All"} onClick={uiState.toggleNewBookings} tiptext={uiState.showAll ? 'Only show new payments' : 'Show all changes this period'} visible/> */}
          <TooltipButton label="Payments Made" onClick={showPaymentsMade} tiptext='Show Payments Made' className='swap-mode' visible/>
          {/* <MyModal icon="bank"  tiptext='View payments summary'>
            <PaymentsSummary />
          </MyModal> */}

        </div>
        {accs.filter(acc=>acc.balance < 0)
          .map((data) => {return (
            <MemberRecipt data={data} key={data.accId} {...{showMemberBookings, accountUpdatePayment}}/>)})}
      </div>
    </Panel>
  )

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
    align-items: flex-start;
    width: auto;
    /*justify-content: flex-start;*/
    height: 100%;
    flex: 0 0 300px;

    .buttons {
      display: flex;
      flex-direction: row;
      padding-bottom: 4px;
      /*max-width: 280px;*/
    }
  }
`;

export default Payments;
