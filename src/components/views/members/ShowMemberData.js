// require('less/watermark.scss');
require('less/showMember.scss');

import React from 'react';
import {Button} from 'react-bootstrap';
// import {Panel} from 'react-bootstrap';
import {Panel, PanelHeader} from 'rebass';

import Logit from '../../../factories/logit.js';
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
    var title = (<h2>{ member.firstName } { member.lastName }</h2>);
    // var memberAdmin = LogonStore.isAuthorized(['admin', 'members']);
    let clss = (member.suspended ? 'suspended' : member.subsStatus) + ' ' + (member.memberStatus || '').toLowerCase();
   // var cellDebug = R.pipe(R.pick(['newBooking', 'book', 'cancel', 'waitlist', 'paidByCredit', 'paidCash', 'creditIssued', 'owing']), JSON.stringify);
    return (
      // <Panel bsStyle='info' className="show-member-details" header={title}  >
      <Panel theme='info' className="show-member-details" >
        <PanelHeader  >{title} </PanelHeader>
        <Button bsSize='small' bsStyle='primary' className={memberAdmin ? 'edit-member' : 'edit-member hidden' }onClick={()=>setShowEditMemberModal(true)}>Edit</Button>
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
        </section>

      </Panel>
      );},
});
export default ShowMemberDetails;
