/* jshint quotmark: false, jquery: true */
import 'sass/memberlist-grid.scss';
import 'sass/showMember.scss';
import React from 'react';
var classnames = require('classnames');
import Paginator from 'views/members/Paginator.js';
// var ShowMemberData = require('views/members/ShowMemberData');
// var TestModal = require('views/members/testModal');
// import EditMemberData from 'views/members/EditMemberData';
import EditMemberData from 'views/members/EditMemberDataR';
import TooltipButton from 'utility/TooltipButton';
import {Panel} from 'utility/AJNPanel'

// import { Panel } from 'react-bootstrap';
import { Button, OverlayTrigger, Tooltip, } from 'react-bootstrap';

import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:navy;', 'MemberList.jsx');
const saveChanges = (values)=>{
  logit('saveChanges', values);
  membersEditSaveChanges({doc: values, origDoc: members});
}
const showResults = values =>{
  logit('showResults', values)
  new Promise(resolve => {
    setTimeout(() => {  // simulate server latency
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
      resolve()
    }, 500)
  })

}

class Memberslist extends React.Component {

  render() {
    logit ('props', this.props);
    var {currentPage, dispStart, dispLength, member, displayMember, sortProp, showEditMemberModal, showModal, allList, memberAdmin} = this.props;
    var {membersListSetSortBy, membersListSetPage, membersListSetDisplayedMember, membersListToggleShowModal, setShowEditMemberModal, membersEditSaveChanges} = this.props.actions;

    dispStart = (currentPage - 1) * dispLength

    var clues = allList
          .filter((m, index)=>(index%dispLength===0))
          .map((m)=>(sortProp === 'name' ? m.lastName.substr(0, 2) : m._id.substr(1)));
    // logit('clues', clues, allList);
    var list = allList.slice(dispStart, dispStart + dispLength);
    var members = list.map((member)=>{
      let clss = classnames('list-line', {current: displayMember === member.memberId}, (member.suspended ? 'suspended' : member.subsStatus));
      // logit('classes', this.props.membersList.status)
      return (
        <div key={member._id} className={clss} onClick={()=>membersListSetDisplayedMember(member.memberId)}>
          {member.memberStatus !== 'Member' ? <span className='member-status'>({member.memberStatus})</span> : null}
          <span className="id">{member._id.substr(1)}</span>
          <span className="name">{member.lastName + ', ' + member.firstName}</span>
        </div>
      );

    });
    let max = Math.ceil(allList.length / dispLength);
    let maxVisible = Math.min(max, sortProp === 'name' ? 7 : 6);
    logit('preReturn', {currentPage, dispStart, dispLength, max, maxVisible}, this.props);

    var title = (<h4>Membership Lists</h4>);
    return (
      <div style={{margin: 20}} >
      <Panel header={title} bsStyle="info" className="member-list">
          <div className="list-index" hidden={showEditMemberModal}>
            {/* <ButtonGroup className='buttons'> */}
              <TooltipButton key="name"  className={sortProp === 'name' ? 'active' : ''} onClick={()=>membersListSetSortBy('name')}>sort by Name</TooltipButton>
              <TooltipButton key="number"  className={sortProp === 'id' ? 'active' : ''} onClick={()=>membersListSetSortBy('id')}>sort by Number</TooltipButton>
            {/* </ButtonGroup> */}

            <Paginator max={max}
              clues={clues} maxVisible={maxVisible}
              currentPage={currentPage}
              changePage={(page)=>membersListSetPage({page: page, value: (page - 1) * dispLength})} className={'by-' + sortProp}/>
            {members}
          </div>
          {/* {!displayMember? null : */}
            <EditMemberData {...{member, showEditMemberModal, setShowEditMemberModal, membersEditSaveChanges, memberAdmin}} onSubmit={showResults} onRequestHide={()=>setShowEditMemberModal(false)}/>
          {/* } */}
          {/*<ShowMemberData {...{member, showEditMemberModal, setShowEditMemberModal, memberAdmin }} />*/}
          <span className="button1" hidden={showEditMemberModal}>
            <OverlayTrigger placement='right' showModal={showModal} toggleShowModal={membersListToggleShowModal} overlay={<Tooltip id='PrintMemberList'>Print Membership List <br/>(Sorted by {sortProp})</Tooltip>}>
              <Button href={'http://steds.dev/server/memberListPDF.php?sort=' + sortProp} target='_blank' ><img src="/images/Printer.svg" /></Button>
            </OverlayTrigger>

          </span>
          {/*<TestModal />*/}
          <span className="button2" hidden={showEditMemberModal}>
            <TooltipButton img="/images/user-add.svg" onClick={()=>this.props.createNewMember()} tiptext='Create a New Member' visible/>
          </span>

      </Panel>
      </div>
    );
  }
}

export default Memberslist;
