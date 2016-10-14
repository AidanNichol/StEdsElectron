/* jshint quotmark: false, jquery: true */
import React from 'react';

import SelectWalk from '../utility/SelectWalk.js';

import {Panel} from '../utility/AJNPanel'


import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'BusLists');


export default function BusLists(props){
    var {bookings, cars, waitingList, walkId, status, walks, cancelBooking, convertToBooking, setCurrentWalk, showMemberBookings} = props;
    logit('props', props);
    const Cars = (props)=>{
      return props.cars.length === 0 ? null :
      (<section>
        <h4>Cars</h4>
        <div header='Added Members' className="booked-cars">
        {
          props.cars.map((bkng)=>
          <div className="member" key={bkng.memId}  onClick={()=>showMemberBookings(bkng.memId)}>
          <span className="bName">{bkng.name} <span className='annotation' style={{float: 'right'}}>{bkng.annotation} </span></span>
          <button type="button" style={{lineHeight: 0.9, fontSize: '80%', fontWeight: 'bold'}} onClick={()=>cancelBooking(bkng.memId, walkId)} >X</button>
          </div>
        )
      }
      </div>

      </section>)
    };
    const Waitlist = (props)=> props.list.length === 0 ? null :
      (<section>
        <h4>Waiting List</h4>
        <div header='Added Members' className="waiting-list">
          {
            props.list.map((bkng)=>{
                return (<div key={bkng.memId} className="member"   onClick={()=>showMemberBookings(bkng.memId)}>
                  <span className="pos">{pos++}. </span><span className="wName">{bkng.name} </span>
                  <button type="button" style={{lineHeight: 0.9, fontSize: '80%'}} onClick={()=>convertToBooking(bkng.memId, walkId)} >✅ </button>
                  <button type="button" style={{lineHeight: 0.9, fontSize: '80%', fontWeight: 'bold'}} onClick={()=>cancelBooking(bkng.memId, walkId)} >X</button>
                </div> )           })
          }
        </div>

      </section>)

     // {/* Ballot box with check
      //   Unicode: U+2611 U+FE0F, UTF-8: E2 98 91 EF B8 8F */}
    var title = (<h4>Bus List</h4>);
    var pos = 1;
    // const showMemberBookings = ()=>{};
    return (
      <Panel header={title} className="bus-list">
        <SelectWalk {...{setCurrentWalk, walks, walkId, currentWalk: walkId}}/>
        {/*<div className="errorMsg">{this.state.msg}</div>*/}
        <div className="booked-members">
          {
            bookings.map((bkng)=>
              <div className="member" key={bkng.memId}  onClick={()=>showMemberBookings(bkng.memId)}>
                <span className="bName">{bkng.name} <span style={{float: 'right'}} className='annotation'>{bkng.annotation}</span></span>
                <button type="button" style={{lineHeight: 0.9, fontSize: '80%', fontWeight: 'bold'}} onClick={()=>cancelBooking(bkng.memId, walkId)} >X</button>
              </div>
            )
          }
        </div>
        <div>Seats available {status.free} </div>
        <Cars cars={cars} />
        <Waitlist list={waitingList} />
        {/*<h4>Cars</h4>
        <div header='Added Members' className="booked-cars">
          {
            cars.map((bkng)=>
              <div className="member" key={bkng.memId}  onClick={()=>showMemberBookings(bkng.memId)}>
                <span className="bName">{bkng.name}</span><span className='annotation'>{bkng.annotation}</span>
                <button type="button" style={{lineHeight: 1}} onClick={()=>cancelBooking(bkng.memId, walkId)} ><Glyphicon glyph="remove" /></button>
              </div>
            )
          }
        </div>*/}
        {/*<h4>Waiting List</h4>
        <div header='Added Members' className="waiting-list">
          {
            waitingList.map((bkng)=>{
                return (<div key={bkng.memId} className="member">
                  <span className="pos">{pos++}. </span><span className="wName">{bkng.name}</span>
                  <button type="button" style={{lineHeight: 1}} onClick={()=>convertToBooking(bkng.memId, walkId)} ><Glyphicon glyph="ok" /></button>
                  <button type="button" style={{lineHeight: 1}} onClick={()=>cancelBooking(bkng.memId, walkId)} ><Glyphicon glyph="remove" /></button>
                </div> )           })
          }
        </div>*/}
      </Panel>
    );
}
