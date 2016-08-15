// require('sass/watermark.scss');
require('sass/showMember.scss');

import React from 'react';
// import {Decorator as Cerebral} from 'cerebral-react';
// import Component from 'cerebral-react';

// import EditMemberData from 'views/members/EditMemberData';

// var ButtonGroup = require('react-bootstrap').ButtonGroup;
// var Tooltip = require('react-bootstrap').Tooltip;
// var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
import {Button, Panel} from 'react-bootstrap';
// var Glyphicon = require('react-bootstrap').Glyphicon;

import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'ShowMemberData.js');


const ShowMemberDetails = React.createClass({
  displayName: 'ShowMemberDetails',
  showSurogate: function(list) {
    if (!list)return [];
    return list.map((mem)=>(<div className="member" key={mem.id}>{mem.name}</div>));
  },
  render: function() {
    var {member, showEditMemberModal, setShowEditMemberModal, memberAdmin} = this.props;
    // var {member, jointWith, actsFor, actsForMe, showEditMemberModal, actions} = this.props;

    if (!member || !member.memberId || showEditMemberModal)return null;
    logit('props', this.props);
    // var jointWithList = this.showSurogate(jointWith);
    // // var actsForList = this.showSurogate(actsFor);
    // var actsForMeList = this.showSurogate(actsForMe);
    var title = (<h2>{ member.firstName } { member.lastName }</h2>);
    // var memberAdmin = LogonStore.isAuthorized(['admin', 'members']);
    let clss = (member.suspended ? 'suspended' : member.subsStatus) + ' ' + (member.memberStatus || '').toLowerCase();
   // var cellDebug = R.pipe(R.pick(['newBooking', 'book', 'cancel', 'waitlist', 'paidByCredit', 'paidCash', 'creditIssued', 'owing']), JSON.stringify);
    return (
      <Panel bsStyle='info' className="show-member-details" header={title}  >
          <Button bsSize='small' bsStyle='primary' className={memberAdmin ? 'edit-member' : 'edit-member hidden' }onClick={()=>setShowEditMemberModal(true)}>Edit</Button>
          {/*<EditMemberData {...{member, jointWith, actsFor, showEditMemberModal, actions }} onRequestHide={()=>setShowEditMemberModal(false)}/>*/}
        <section className={'user-details ' + clss}>
        <div className="form-line">
            <span className="item-label">firstName</span>
            <span className="item-value" >{member.firstName}</span>
        </div>
        <div className="form-line">
            <span className="item-label">lastName</span>
            <span className="item-value" >{member.lastName}</span>
        </div>
        <div className="form-line">
            <span className="item-label">address</span>
            <span className="item-value" >{member.address}</span>
        </div>
        <div className="form-line">
            <span className="item-label">phone</span>
            <span className="item-value" >{member.phone}</span>
        </div>
        <div className="form-line">
            <span className="item-label">email</span>
            <span className="item-value" >{member.email}</span>
        </div>
        <div className="form-line">
            <span className="item-label">mobile</span>
            <span className="item-value" >{member.mobile}</span>
        </div>
        <div className="form-line">
            <span className="item-label">subscription</span>
            <span className={'item-value ' + member.subsStatus} >{member.subscription}</span>
        </div>
        <div className="form-line">
            <span className="item-label">nextOfKin</span>
            <span className="item-value" >{member.nextOfKin}</span>
        </div>
        <div className="form-line">
            <span className="item-label">medical</span>
            <span className="item-value" >{member.medical}</span>
        </div>
        <div className="form-line">
            <span className="item-label">Member Id</span>
            <span className="item-value">{member.memberId && member.memberId.substr(1)}</span>
        </div>
        <div className="form-line">
            <span className="item-label">Account</span>
            <span className="item-value">{member.account}</span>
        </div>
        {member.memberStatus &&
          <div className="form-line">
              <span className="item-label">Status</span>
              <span className="item-value">{member.memberStatus}</span>
          </div>
        }
        {/*{jointWithList.length > 0 &&
          <div className="form-line">
              <span className="item-label">Joint with</span>
              <div className="item-display">{jointWithList}</div>
          </div>
        }
        {actsForMeList.length > 0 &&
          <div className="form-line">
              <span className="item-label">Acts for Me</span>
              <div className="item-display">{actsForMeList}</div>
          </div>
        }*/}
        </section>

      </Panel>
      );},
});
export default ShowMemberDetails;
