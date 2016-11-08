/* jshint quotmark: false, jquery: true */
import React from 'react';

import SelectMember from '../utility/RSelectMember.js';
import SelectWalk from '../utility/SelectWalk.js';

import {Panel} from '../utility/AJNPanel'


import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'BulkAdd');

var AddMember = (props)=> {
  var {name, paid, accId, memId, walkId, amount, paidChanged, waitlisted} = props;
  // var iveChanged = () =>{
  //   paidChanged({accId, amount, memId, walkId});
  // };
    return (
      <div className="member">
        <span className="bName">{name}</span>
        {
          waitlisted || <input className="checkbox" type="checkbox" alt="paid" checked={paid} onChange={()=>paidChanged({accId, amount, memId, walkId})} />
        }
      </div>
      );
  }


export default function BulkAdd(props) {
    var {bookings, waitingList, walkId, amount, walks, accountAddPayment, accountDelPayment, memSelected, setCurrentWalk, currentWalk, addToWaitList, toggleAddToWaitList} = props;
    logit('props', props);
    var title = (<h4>Bulk Add</h4>);
    var pos = 1;
    return (
      <Panel header={title} className="bulk-add">
        <SelectWalk {...{setCurrentWalk, walks, currentWalk}}/>
        <div className="select" style={{postion: "relative"}}>
          <span style={{width: "50%", display: "inline-block"}}>
            <SelectMember style={{width: "50%", maxWidth: "50%", marginTop: "20px"}} valueKey="memId" options={props.options} onSelected={memSelected}/>
          </span>
        </div>
        <span className="add-to-wl" style={{postion: "relative", bottom: "10px"}}>
        Add to Waitlist <input className="checkbox" type="checkbox" alt="paid" checked={addToWaitList} onChange={toggleAddToWaitList} />
        </span>
        {/*<div className="errorMsg">{state.msg}</div>*/}
        <div className="added-members">
          {
            bookings.map((bkng)=>
              <AddMember key={bkng.memId} {...bkng} {...{amount, walkId}} paidChanged={bkng.paid ? accountDelPayment : accountAddPayment}  />
            )
          }
        </div>
        <div className="waiting-list">
          {
            waitingList.map((bkng)=>{
                return (<div key={bkng.memId} className="member">
                <span className="pos">{pos++}. </span><span className="wName">{bkng.name}</span>
                </div> )           })
          }
        </div>
      </Panel>
    );
  }
