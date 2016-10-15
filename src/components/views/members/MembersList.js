/* jshint quotmark: false, jquery: true */
import React from 'react';
var classnames = require('classnames');
import Paginator from './Paginator.js';
// var ShowMemberData = require('views/members/ShowMemberData');
// var TestModal = require('views/members/testModal');
// import EditMemberData from '../views/members/EditMemberData.js';
import EditMemberData from './EditMemberDataR.js';
import TooltipButton from '../../utility/TooltipButton.js';
import {Panel} from '../../utility/AJNPanel'

import Logit from '../../../factories/logit.js';
var logit = Logit('color:white; background:navy;', 'MemberList.jsx');
// const saveChanges = (values)=>{
//   logit('saveChanges', values);
//   membersEditSaveChanges({doc: values, origDoc: members});
// }
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
    // var {currentPage, dispStart, dispLength, member, displayMember, sortProp, showEditMemberModal, showModal, allList, memberAdmin} = this.props;
    // var {membersListSetSortBy, membersListSetPage, membersListSetDisplayedMember, membersListToggleShowModal, setShowEditMemberModal, membersEditSaveChanges} = this.props.actions;
    var {currentPage, dispStart, dispLength, member, displayMember, sortProp,
        showEditMemberModal, showModal, allList, memberAdmin, newMember,
        membersListSetSortBy, membersListSetPage, membersListSetDisplayedMember,
        membersListToggleShowModal, setShowEditMemberModal, membersListPrint,
        createNewMember, membersEditSaveChanges} = this.props;

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
      <div style={{margin: "0 10px 0 10px"}} >
      <Panel header={title} className="member-list" id="steds_memberlist">
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
            <EditMemberData {...{member, newMember, showEditMemberModal, setShowEditMemberModal, membersEditSaveChanges, memberAdmin}} onSubmit={showResults} onRequestHide={()=>setShowEditMemberModal(false)}/>
          {/* } */}
          {/*<ShowMemberData {...{member, showEditMemberModal, setShowEditMemberModal, memberAdmin }} />*/}
          <span className="button1" hidden={showEditMemberModal}>
              <TooltipButton onClick={()=>membersListPrint(allList)} placement='right' tiptext={`Print Membership List
                (Sorted by ${sortProp})`} icon="Printer" />
          </span>
          <span className="button2" hidden={showEditMemberModal}>
            <TooltipButton icon="user-add" onClick={()=>createNewMember()} tiptext='Create a New Member' visible/>
          </span>

      </Panel>
      </div>
    );
  }
}

export default Memberslist;
