/* jshint quotmark: false */
// var _ = require('lodash');
import React from 'react';
// var classNames = require('classnames');
// var R = require('ramda');
import { Panel } from 'react-bootstrap';
// var words = require("underscore.string/words");
import TooltipButton from '../utility/TooltipButton.js';
import TooltipContent from '../utility/TooltipContent.js';

// => hello-world
import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments.js');



function MemberBill(props){

    var {data, accountUpdatePayment} = props;
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

    var details = data.debt.map((bkng)=>
        <div className='walk-detail' key={bkng.dat}>{bkng.dispDate} {bkng.text} </div>
    );
    return (<div className="debtor" >
              <div className="overview">
                <span className="who"> {data.accName}</span>
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

    logit('payments', props);
    var {debts, accountUpdatePayment} = props;
    var title = (<h3>Payments Due</h3>);
    return (
    <Panel className="payments" header={title} bsStyle='info' style={{margin:20}} >
      <div className="all-debts">
        <div className="header">
          <span className="who">Details</span><span className="owed">Owed</span><span className="paid">Paid</span>
        </div>
        {
          debts.map((data) => {console.log('payment', data);return <MemberBill data={data} key={data.accId} {...{accountUpdatePayment}}/>})
        }
      </div>
    </Panel>
  )

}
