/* jshint quotmark: false */
import React from 'react';
import {Panel} from '../utility/AJNPanel'
import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
import TooltipContent from '../utility/TooltipContent.js';
import PaymentsSummary from './PaymentsSummary'
// import showNewWindow from 'utilities/showNewWindow.js';
import {Icon} from 'ducks/walksDuck'
import {Lock} from 'ducks/lock-duck'

import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:View');



function MemberBill(props){

    var {data, accountUpdatePayment, showMemberBookings} = props;
    logit('props', props);
    let handleKeydown = (event)=> {
      var amount = parseInt(event.target.value);
      if ( event.which === 13 && amount > 0) {
        event.preventDefault();
        accountUpdatePayment(data.accId, amount);
        event.target.value = '';
      }
    };
    let paidInFull = (event)=> {
      accountUpdatePayment(data.accId, -data.balance);
      event.target.value = '';
    };
    var details = data.debt.filter((bkng)=>bkng.outstanding).map((bkng)=>
        <div className='walk-detail' key={bkng.dat}>{bkng.dispDate}<Icon type={bkng.req} width="16"/>  {bkng.text}{bkng.name &&(<span className="name">[{bkng.name}]</span>)} </div>
    );
    return (<div className="debtor" >
              <div className="overview">
                <span className="who" onClick={()=>showMemberBookings(data.accId)}> {data.accName}</span>
                {/*<span className="owed">£{(-data.balance).toFixed(2)}</span>*/}
                {/*<span>*/}
                  {/*<span className="owed">*/}
                    <TooltipButton className="owed" label={`£${(-data.balance).toFixed(2)}`} onClick={paidInFull} tiptext='Paid Full Amount' visible/>
                  {/*</span>*/}

                  <TooltipContent tiptext='Enter paid amount and press enter' visible>
                    <span className="paid">£<input type="text" onKeyDown={handleKeydown} /></span>
                  </TooltipContent>

                {/*</span>*/}
              </div>
              <div className="details">
                { details}
              </div>
            </div>
      );
}

export default function Payments(props){

  // const showPaymentSummary = ()=>{showNewWindow('paymentsSummary')}
  logit('payments', props);
  var {debts, accountUpdatePayment, showMemberBookings} = props;
  var title = (<h4>Payments Due</h4>);
  return (
    <Panel className="payments" header={title} style={{margin:20}} >
      <div className="all-debts">
        <div className="buttons">
          <Lock />
          {/* <TooltipButton label="Summary" onClick={()=>{showSummary=true; logit('showSummary', showSummary)}} tiptext='Show Payment Summary' visible/> */}
          <MyModal icon="bank"  tiptext='View payments summary'>
          <PaymentsSummary />
          </MyModal>

        </div>
        {/* //inside the render
        <a onClick={()=>{this.refs.modal.show()}}>Open Modal</a>
        <Modal ref="modal"
        className="simple-modal your-class"
        closeOnOuterClick={false}>

        <a className="close" onClick={()=>{this.refs.modal.hide()}}>X</a>
        <div>hey</div>

        </Modal> */}
        {/* <div className="header">
          <span className="who">Details</span><span className="owed">Owed</span><span className="paid">Paid</span>
        </div> */}
        {
          debts.map((data) => {console.log('payment', data);return <MemberBill data={data} key={data.accId} {...{accountUpdatePayment, showMemberBookings}}/>})
        }
      </div>
    </Panel>
  )

}
