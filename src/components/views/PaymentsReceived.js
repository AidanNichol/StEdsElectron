/* jshint quotmark: false */
import React from 'react';
import {Panel} from '../utility/AJNPanel'
// import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
import classnames from 'classnames';
import{paymentsSummaryReport} from 'reports/paymentsSummaryReport2';
import {PrintButton} from 'components/utility/PrintButton'
// import TooltipContent from '../utility/TooltipContent.js';
// import PaymentsSummary from './PaymentsSummary'
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
  const cls = classnames({detail: true, [className]: true, newBkng: bkng.activeThisPeriod && !(bkng.paid &&bkng.paid.P > 0 )});
  const paid = [['+', 'Cr:'], ['T', 'T:'], ['P', '£']].map(([code, txt])=>{
    return (bkng.paid && bkng.paid[code]) ? (<span className={'paid-'+code} key={code}>&nbsp;{txt+bkng.paid[code]}</span>) : null
  })
  return (
  <div className={cls} key={bkng.dat}>
    {bkng.dispDate}
    <Icon type={ bkng.req } width='16' />
    <span className="text">
      { bkng.name && <span className='name'>[{bkng.name}]</span> }
      {bkng.text}
    </span>
    <span className="paid">{paid}</span>
  </div>
)});
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

.paid {margin: 2px;}
.paid-T {
  color: blue;
}
.text {
  display: inline-block;
  position: relative;
  top: 5px;
  min-width: 120px;
  max-width: 120px;
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
`

const memberRecipt = observer((props)=>{

    var {data, showMemberBookings} = props;
    logit('props', props);

    return (
      <div className={props.className+' member-rcpt'}>
        <div className="overview">
          <span className="who" onClick={()=>showMemberBookings(data.accId)}> {data.accName}</span>
          {data.paymentsMade > 0 ? <TooltipButton className="owed" label={`£${(data.paymentsMade)}`} visible/> : null}

        </div>
        {data.logs.filter(bkng=>bkng.type==='W' && bkng.activeThisPeriod )
          .filter((bkng)=>(bkng.paid && bkng.paid.P > 0) || uiState.showAll)
          .map(bkng=>{if (bkng.accId==='A2015')logit('A2105',bkng.text, bkng.paid, uiState.showAll, (bkng.paid && bkng.paid.P > 0)); return bkng})
          .map((bkng)=>(<Detail bkng={bkng} key={bkng.dat+'xx'}/>))}
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

// const showRecipts = observer(({accs, showMemberBookings, className})=>{
//
//     const recipts = accs.filter(acc=>uiState.showAll || acc.paymentsMade > 0).map((data) => {return <MemberRecipt data={data} key={data.accId} {...{showMemberBookings}}/>})
//     return (<div className={className}>{recipts}</div>)
//
// });
// export const ShowRecipts = styled(showRecipts)`
//   display: flex;
//   flex-direction: column;
//   flex-wrap: wrap;
//   flex: 0 0 315px;
//   justify-content: flex-start;
//   height: 100%;
// `

export const payments = observer((props)=>{

  // const showPaymentSummary = ()=>{showNewWindow('paymentsSummary')}
  logit('payments props', props, uiState);
  var {accs, startDate, totalPaymentsMade, showPaymentsDue, className, showMemberBookings, bankMoney, doc} = props;

  var title = (
    <h4>
      Payments Made &nbsp; &nbsp; &mdash; &nbsp; &nbsp; Total Payments Received
      <span className='startDate' style={{fontSize: '0.8em', fontStyle: 'italic'}}>(since {startDate})</span>:
      &nbsp; £{totalPaymentsMade}
    </h4>);
  return (
    <Panel className={"paymentsMade "+className} header={title} style={{margin:20}} >
      <div className="all-payments">
        <div className="buttons">
          <Lock />
          <TooltipButton label="Show Payments Due" onClick={showPaymentsDue} tiptext='Show Payments Due' className='swap-mode' visible/>
          <TooltipButton label={uiState.showAll ? "Only Payments" : "All Changes"} onClick={uiState.toggleNewBookings} tiptext={uiState.showAll ? 'Only show new payments' : 'Show all changes this period'} className='range' visible/>
          <PrintButton  onClick={()=>paymentsSummaryReport(doc)} tiptext="Print Summary Report" visible/>
          <TooltipButton icon="bank" onClick={()=>{paymentsSummaryReport(doc);bankMoney(doc)}} tiptext="Bank the money and start new period" visible/>
          {/* <MyModal icon="bank"  tiptext='View payments summary'>
            <PaymentsSummary />
          </MyModal> */}

        </div>
        {/* <ShowRecipts {...{accs, showMemberBookings}}/> */}
        { accs.filter(acc=>acc.activeThisPeriod && (uiState.showAll || acc.paymentsMade > 0))
          .map((data) => {return <MemberRecipt data={data} key={data.accId} {...{showMemberBookings}}/>})
        }
        {/* { accs.filter(acc=>uiState.showAll || acc.paymentsMade > 0)
          .map((data) => {return <MemberRecipt data={data} key={data.accId+'-2'} {...{showMemberBookings}}/>})
        } */}
      </div>
    </Panel>
    )

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

    .buttons {
      display: flex;
      flex-direction: row;
      padding-bottom: 4px;
      /*max-width: 280px;*/
    }
  }
`;

export default Payments;
