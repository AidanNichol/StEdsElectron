/* jshint quotmark: false, jquery: true */
import React from 'react';
// import _ from 'lodash';
import classnames from 'classnames';

import { Panel} from 'react-bootstrap';
import SelectMember from '../../utility/RSelectMember.js';
import {request, Icon} from '../../../ducks/walksDuck'
import ChangeLog from '../../containers/PaymentStatusLog-container.js';
import {AnnotateBooking} from './annotateBooking'
// import ChangeLog from '..//utility/ChangeLog.js';

// var AJNLogging = require('../utilities/utility').AJNLogging;
import Logit from '../../../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'bookings');

var Bookings = React.createClass({
  render: function() {
    var {accNames, walks, walkUpdateBooking, walkCancelBooking, annotateOpenDialog, accountSelected, account, annotate} = this.props;
    var accId = account.accId;
    logit('props', this.props);

    var newBooking = (walkId, memId, avail, i)=>{
      // logit('newBookings', {walkId,memId, avail, i})
      let reqType = (avail ? request.BOOKED : request.WAITLIST);
      return (
        // <div className={'book member'+i} key={memId} onClick={()=>walkUpdateBooking(walkId, accId, memId, reqType)} >
        <div className={'bookingcell book member'+i} key={memId} >
          <span className='hotspot fullwidth' onClick={()=>walkUpdateBooking(walkId, accId, memId, reqType)}><Icon type={reqType} /></span>
          <span className='hotspot halfwidth' onClick={()=>walkUpdateBooking(walkId, accId, memId, request.WAITLIST)}><Icon type={request.WAITLIST} /></span>
          <span className='hotspot halfwidth' onClick={()=>walkUpdateBooking(walkId, accId, memId, request.CAR)}><Icon type={request.CAR} /></span>
        </div>
    )};
    var oldBooking = (walkId, memId, status, anno, i) =>{
        const width = status === 'W' ? ' halfwidth' : ' fullwidth'
        return (
          <div className={'bookingcell booked member'+i} style={{position: 'relative'}} key={memId} >
                <Icon type={status} className='normal '/>
                <span className='normal annotation'>{anno}</span>
                <Icon className={'hotspot '+width} type={status+'X'} onClick={()=>walkCancelBooking(walkId, accId, memId, status)} />
                {status === 'W' ?
                <span className={'hotspot bookme fa-stack'+width} onClick={()=>walkUpdateBooking(walkId, accId, memId, request.BOOKED)}><Icon type='B' /></span> : null
                }
                <span className='hotspot fullwidth annotate' onClick={()=>annotateOpenDialog(walkId, memId)}><Icon type='A' /></span>
          </div>
        );
    };
    var title = (<h4>Bookings</h4>);
    var bCl = classnames({bookings: true, ['mems'+accNames.length]: true});
    return (
      <Panel header={title} bsStyle='info'  className={bCl}>
      <link rel="stylesheet" href="less/bookings.less" />
      <div className="select">
        <SelectMember style={{width: "200px", marginTop: "20px"}} options={this.props.options} onSelected={accountSelected}/>
        {accNames.map((member)=>( <h5 key={member.memId}>{ member.firstName } { member.lastName }</h5> ))}
      </div>
      <div className="bTable">
        <div className="heading">
          <div className="title date">Date<br/>Venue</div>
          <div className="title avail">Available</div>
          {accNames.map((member, i)=>( <div className={'avail member'+i+(member.suspended ? ' suspended' : '')} key={member.memId}>{member.firstName }</div> ))}
        </div>
        {walks.map((walk)=>(
          <div className="walk" key={'WWW'+walk.walkId}>
          <div className="date">{walk.walkDate}<br/>{walk.venue}</div>
          <div className="avail">{walk.status.display}</div>
          {
            walk.bookings.map((booking, i)=>
              request.bookable(booking.status) ?
                  newBooking(walk.walkId, booking.memId, walk.status.available > 0, i) :
                  oldBooking(walk.walkId, booking.memId, booking.status, booking.annotation, i) )
          }
          </div>

        ))}
        <AnnotateBooking {...annotate}/>
      </div>

      <ChangeLog accId={accId}/>
      </Panel>
      );
  },
});
module.exports = Bookings;
