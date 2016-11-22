/* jshint quotmark: false, jquery: true */
import React from 'react';
import {Lock} from 'ducks/lock-duck'
import {PrintButton} from 'sagas/reportsSaga';

import SelectWalk from '../utility/SelectWalk.js';

import {Panel} from '../utility/AJNPanel'


import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:blue;', 'BusLists:view');


export default function BusLists(props){
    var {bookings, cars, waitingList, walkId, status, walks, cancelBooking,
      convertToBooking, setCurrentWalk, showMemberBookings, printBusList} = props;
    logit('props', props);

    const Cars = (props)=>{
      return props.cars.length === 0 ? null :
      (<section  className="booked-cars">
        <h4>Cars</h4>
        {
          props.cars.map((bkng)=>
          <div className="member" key={bkng.memId}  onClick={()=>showMemberBookings(bkng.memId)}>
          <div className="bName">{bkng.name}</div> <div className='annotation'>{bkng.annotation}
            <button type="button" style={{lineHeight: 0.9, fontSize: '80%', fontWeight: 'bold'}} onClick={()=>cancelBooking(bkng.memId, walkId)} >X</button>
          </div>
          </div>
        )
      }
      </section>)
    };
    const Waitlist = (props)=> props.list.length === 0 ? null :
      (<div  className="waiting-list">
        <h4>Waiting List</h4>

          {
            props.list.map((bkng)=>{
                return (<div key={bkng.memId} className="member"   onClick={()=>showMemberBookings(bkng.memId)}>
                  <div className="wName"><span className="pos">{pos++}. </span>{bkng.name} </div>
                  <div className='annotation'>{bkng.annotation}
                    <button type="button" style={{lineHeight: 0.9, fontSize: '80%'}} onClick={()=>convertToBooking(bkng.memId, walkId)} >✅ </button>
                    <button type="button" style={{lineHeight: 0.9, fontSize: '80%', fontWeight: 'bold'}} onClick={()=>cancelBooking(bkng.memId, walkId)} >X</button>
                  </div>
                </div> )           })
          }

      </div>)

     // {/* Ballot box with check
      //   Unicode: U+2611 U+FE0F, UTF-8: E2 98 91 EF B8 8F */}
    var title = (<h4>Bus List</h4>);
    var pos = 1;
    // const showMemberBookings = ()=>{};
    return (
      <Panel header={title} className="bus-list">
        <SelectWalk {...{setCurrentWalk, walks, walkId, currentWalk: walkId}}/>
        <Lock />
        {/*<div className="errorMsg">{this.state.msg}</div>*/}
        <PrintButton report='busList' tiptext='Print All  Walks PDF' />
        {/* <div><button type="button" onClick={()=>{logit('clicked', '');printBusList()}}>Print All  Walks PDF</button></div> */}
        <div className="booked-members">
          {
            bookings.map((bkng)=>
              <div className="member" key={bkng.memId} >
                <div className="bName" onClick={()=>showMemberBookings(bkng.memId)}>{bkng.name} </div><div className='annotation'>{bkng.annotation}
                  <button type="button" style={{lineHeight: 0.9, fontSize: '80%', fontWeight: 'bold'}} onClick={()=>cancelBooking(bkng.memId, walkId)} >X</button>
                </div>
              </div>
            )
          }
          <div className="seats-available">Seats available <div>{status.free} </div></div>
        </div>
        <div className="others">
        <Waitlist list={waitingList} />
        <Cars cars={cars} />
        {/* {others} */}
        </div>        {/* <Others cars={cars} list={waitingList} /> */}
      </Panel>
    );
}
