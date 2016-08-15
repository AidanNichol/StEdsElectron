/* jshint quotmark: false, jquery: true */
import React from 'react';

import SelectWalk from 'components/utility/SelectWalk';

// import {Panel as MyPanel} from 'components/utility/Panel';
import {Panel, Button, Glyphicon} from 'react-bootstrap';

import 'sass/busList.scss';

import Logit from 'factories/logit.js';
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
          <span className="bName">{bkng.name}</span><span className='annotation'>{bkng.annotation}</span>
          <Button type="button" bsSize="xsmall" style={{lineHeight: 1}} onClick={()=>cancelBooking(bkng.memId, walkId)} ><Glyphicon glyph="remove" /></Button>
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
            props.ist.map((bkng)=>{
                return (<div key={bkng.memId} className="member">
                  <span className="pos">{pos++}. </span><span className="wName">{bkng.name}</span>
                  <Button type="button" bsSize="xsmall" style={{lineHeight: 1}} onClick={()=>convertToBooking(bkng.memId, walkId)} ><Glyphicon glyph="ok" /></Button>
                  <Button type="button" bsSize="xsmall" style={{lineHeight: 1}} onClick={()=>cancelBooking(bkng.memId, walkId)} ><Glyphicon glyph="remove" /></Button>
                </div> )           })
          }
        </div>

      </section>)
    var title = (<h4>Bus List</h4>);
    var pos = 1;
    // const showMemberBookings = ()=>{};
    return (
      <Panel header={title} bsStyle="info" className="bus-list">
        <SelectWalk {...{setCurrentWalk, walks, walkId, currentWalk: walkId}}/>
        {/*<div className="errorMsg">{this.state.msg}</div>*/}
        <div header='Added Members' className="booked-members">
          {
            bookings.map((bkng)=>
              <div className="member" key={bkng.memId}  onClick={()=>showMemberBookings(bkng.memId)}>
                <span className="bName">{bkng.name}</span><span className='annotation'>{bkng.annotation}</span>
                <Button type="button" bsSize="xsmall" style={{lineHeight: 1}} onClick={()=>cancelBooking(bkng.memId, walkId)} ><Glyphicon glyph="remove" /></Button>
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
                <Button type="button" bsSize="xsmall" style={{lineHeight: 1}} onClick={()=>cancelBooking(bkng.memId, walkId)} ><Glyphicon glyph="remove" /></Button>
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
                  <Button type="button" bsSize="xsmall" style={{lineHeight: 1}} onClick={()=>convertToBooking(bkng.memId, walkId)} ><Glyphicon glyph="ok" /></Button>
                  <Button type="button" bsSize="xsmall" style={{lineHeight: 1}} onClick={()=>cancelBooking(bkng.memId, walkId)} ><Glyphicon glyph="remove" /></Button>
                </div> )           })
          }
        </div>*/}
      </Panel>
    );
}
