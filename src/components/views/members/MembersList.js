/* jshint quotmark: false, jquery: true */
import React from 'react';
var classnames = require('classnames');
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
    var {dispStart, dispLength, member, displayMember, sortProp,
        showEditMemberModal, allList, memberAdmin, newMember,
        membersListSetSortBy, membersListSetPage, membersListSetDisplayedMember,
        setShowEditMemberModal, membersListPrint, memberIndex,
        createNewMember, membersEditSaveChanges} = this.props;

    // if (resync && syncPos != dispStart) membersListSetPage({page: 1, value: syncPos});
    // dispStart = (currentPage - 1) * dispLength

    // var clues = allList
    //       .filter((m, index)=>(index%dispLength===0))
    //       .map((m)=>(sortProp === 'name' ? m.lastName.substr(0, 2) : m._id.substr(1)));
    // // logit('clues', clues, allList);
    var list = allList.slice(dispStart, dispStart + dispLength);

    var members = list.map((member)=>{
      var showMemberStatus = member.memberStatus !== 'Member' && member.memberStatus !== 'OK';
      let clss = classnames('list-line', [member.memberStatus]: true, {current: displayMember === member.memberId}, (member.suspended ? 'suspended' : member.subsStatus));
      // logit('classes', this.props.membersList.status)
      return (
        <div key={member._id} className={clss} onClick={()=>membersListSetDisplayedMember(member.memberId)}>
          {showMemberStatus && <span className='member-status'>({member.memberStatus})</span>}
          <span className="id">{member._id.substr(1)}</span>
          <span className="name">{member.lastName + ', ' + member.firstName}</span>
        </div>
      );
    });

    var index = memberIndex.key.map(([disp, key, start], i, idx)=>{
      let value = start;
      let end = i < idx.length-1 ? idx[i+1][2]-1 : allList.length-1;
      let seeStart = start >= dispStart && start < dispStart + dispLength;
      let seeEnd = end >= dispStart && end < dispStart + dispLength;
      let partVisible= seeStart || seeEnd
      let allVisible = seeStart && seeEnd
      let cl = classnames({indexItem: true, partVisible, allVisible});
      return (
        <div className={cl}
              onClick={()=>membersListSetPage({value})}
              key={"mem:index:"+key}>{disp}</div>)
    });

    var title = (<h4>Membership Lists</h4>);
    return (
      <Panel header={title} className="member-list" id="steds_memberlist">
          {/* <div className="list-index" hidden={showEditMemberModal}> */}
            <div className='sort-buttons' hidden={showEditMemberModal}>
              <TooltipButton key="name"  className={sortProp === 'name' ? 'active' : ''} onClick={()=>membersListSetSortBy('name')}>sort by Name</TooltipButton>
              <TooltipButton key="number"  className={sortProp === 'id' ? 'active' : ''} onClick={()=>membersListSetSortBy('id')}>sort by Number</TooltipButton>
            </div>
            <div className="index" hidden={showEditMemberModal}>
              {index}
            </div>
            {/* <Paginator max={max}
              clues={clues} maxVisible={maxVisible}
              currentPage={currentPage}
              changePage={(page)=>membersListSetPage({page: page, value: (page - 1) * dispLength})} className={'by-' + sortProp}/> */}
            <div className="names" hidden={showEditMemberModal}>
              {members}
            </div>
          {/* </div> */}
          {/* {!displayMember? null : */}
            <EditMemberData className="details" {...{member, newMember, showEditMemberModal, setShowEditMemberModal, membersEditSaveChanges, memberAdmin}}
                onSubmit={showResults} onRequestHide={()=>setShowEditMemberModal(false)}
                style={{minHeight: '100%'}}/>
          {/* } */}
          {/*<ShowMemberData {...{member, showEditMemberModal, setShowEditMemberModal, memberAdmin }} />*/}
          <span className="action-buttons" hidden={showEditMemberModal}>
            <TooltipButton onClick={()=>membersListPrint(allList)} placement='right' tiptext={`Print Membership List
                (Sorted by ${sortProp})`} icon="Printer" />
            <TooltipButton icon="user-add" onClick={()=>createNewMember()} tiptext='Create a New Member' visible/>
          </span>

      </Panel>
    );
  }
}

export default Memberslist;
