/* jshint quotmark: false, jquery: true */
import React from 'react';

import SelectMember from '../utility/RSelectMember.js';
import SelectWalk from '../utility/SelectWalk.js';

// import {Panel as MyPanel} from '../utility/Panel.js';
import {Panel} from 'react-bootstrap';


import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'BulkAdd');

var AddMember = React.createClass({
  displayName: 'AddMember',
  render: function() {
  var {name, paid, accId, memId, walkId, amount, paidChanged, waitlisted} = this.props;
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
  },
});


var BulkAdd = React.createClass({
  displayName: 'Bulkadd',
  render: function() {
    var {bookings, waitingList, walkId, amount, walks, accountAddPayment, accountDelPayment, memSelected, setCurrentWalk, currentWalk, addToWaitList, toggleAddToWaitList} = this.props;
    logit('props', this);
    var title = (<h4>Bulk Add</h4>);
    var pos = 1;
    return (
      <Panel header={title} bsStyle="info" className="bulk-add">
        <SelectWalk {...{setCurrentWalk, walks, currentWalk}}/>
        <div className="select" style={{postion: "relative"}}>
          <span style={{width: "50%", display: "inline-block"}}>
            <SelectMember style={{width: "50%", maxWidth: "50%", marginTop: "20px"}} valueKey="memId" options={this.props.options} onSelected={memSelected}/>
          </span>
          <span style={{postion: "relative", bottom: "10px"}}>
            Add to Waitlist <input className="checkbox" type="checkbox" alt="paid" checked={addToWaitList} onChange={toggleAddToWaitList} />
          </span>
        </div>
        {/*<div className="errorMsg">{this.state.msg}</div>*/}
        <div header='Added Members' className="added-members">
          {
            bookings.map((bkng)=>
              <AddMember key={bkng.memId} {...bkng} {...{amount, walkId}} paidChanged={bkng.paid ? accountDelPayment : accountAddPayment}  />
            )
          }
        </div>
        <h3>Waiting List</h3>
        <div header='Added Members' className="waiting-list">
          {
            waitingList.map((bkng)=>{
                return (<div key={bkng.memId} className="member">
                <span className="pos">{pos++}. </span><span className="wName">{bkng.name}</span>
                </div> )           })
          }
        </div>
      </Panel>
    );
  },
});
module.exports = BulkAdd;
