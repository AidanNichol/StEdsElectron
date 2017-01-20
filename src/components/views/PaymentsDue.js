/* jshint quotmark: false */
import React from 'react';
import {Panel} from '../utility/AJNPanel'
// import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
import TooltipContent from '../utility/TooltipContent.js';
// import PaymentsSummary from './PaymentsSummary'
import {MemberRecipt as MemberBill} from './PaymentsMade'
// import showNewWindow from 'utilities/showNewWindow.js';
import styled from 'styled-components';
// import {Icon} from 'ducks/walksDuck'
import {Lock} from 'ducks/lock-duck'

import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Due');

const enterPayment = ({accId, accountUpdatePayment})=>{
  let handleKeydown = (event)=> {
    var amount = parseInt(event.target.value);
    if ( event.which === 13 && amount > 0) {
      event.preventDefault();
      accountUpdatePayment(accId, amount);
      event.target.value = '';
    }
  };
  const comp = (<TooltipContent tiptext='Enter paid amount and press enter' visible>
    <span className="paid">£<input type="text" onKeyDown={handleKeydown} /></span>
  </TooltipContent>);

  return styled(comp)`
    .paid {
      width: 60px;
      text-align: center;
      margin-left: 20px;

      input {
        width: 40px;
        font-size: 0.85em;
      }
    }`
}

// function MemberBill(props){
//
//     var {data, accountUpdatePayment, showMemberBookings} = props;
//     // logit('props', props);
//
//     let paidInFull = (event)=> {
//       accountUpdatePayment(data.accId, -data.balance);
//       event.target.value = '';
//     };
//     var details = data.debt.filter((bkng)=>bkng.outstanding).map((bkng)=>
//         <div className='walk-detail' key={bkng.dat}>{bkng.dispDate}<Icon type={bkng.req} width="16"/>  {bkng.text}{bkng.name &&(<span className="name">[{bkng.name}]</span>)} </div>
//     );
//     return (
//       <div className="debtor" >
//         <div className="overview">
//           <span className="who" onClick={()=>showMemberBookings(data.accId)}> {data.accName}</span>
//           <TooltipButton className="owed" label={`£${(-data.balance).toFixed(2)}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/>
//           {EnterPayment}
//         </div>
//         <div className="details">
//           { details}
//         </div>
//       </div>
//     );
// }

export default function Payments(props){

  // const showPaymentSummary = ()=>{showNewWindow('paymentsSummary')}
  logit('payments props', props);
  var {debts, accountUpdatePayment, showMemberBookings, showPaymentsMade} = props;
  var title = (<h4>Payments Due</h4>);
  return (
    <Panel className="payments" header={title} style={{margin:20}} >
      <div className="all-debts">
        <div className="buttons">
          <Lock />
          <TooltipButton label="Summary" onClick={showPaymentsMade} tiptext='Show Payments Made' visible/>
          {/* <MyModal icon="bank"  tiptext='View payments summary'>
            <PaymentsSummary />
          </MyModal> */}

        </div>

        {
          debts.map((data) => {return <MemberBill data={data} key={data.accId} {...{enterPayment, accountUpdatePayment, showMemberBookings}}/>})
        }
      </div>
    </Panel>
  )

}
