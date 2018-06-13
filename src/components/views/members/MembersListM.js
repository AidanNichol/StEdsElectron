/* jshint quotmark: false, jquery: true */
import React from 'react';
import { observer } from 'mobx-react';
var classnames = require('classnames');
import EditMemberData from './EditMemberDataM.js';
import TooltipButton from '../../utility/TooltipButton.js';
import { PrintButton } from '../../utility/PrintButton';
import { membershipListReport } from '../../../reports/membershipListPDF2';
import { Icon } from '../../utility/Icon';
import { Panel } from '../../utility/AJNPanel';

import Logit from 'logit';
var logit = Logit(__filename);
// const saveChanges = (values)=>{
//   logit('saveChanges', values);
//   membersEditSaveChanges({doc: values, origDoc: members});
// }
const showResults = values => {
  logit('showResults', values);
  new Promise(resolve => {
    setTimeout(() => {
      // simulate server latency
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
      resolve();
    }, 500);
  });
};

@observer
class Memberslist extends React.Component {
  render() {
    logit('props', this.props);
    var {
      dispStart,
      dispLength,
      editMember,
      sortProp,
      editMode,
      allList,
      membersAdmin,
      newMember,
      setActiveMember,
      activeMemberId,

      setEditMode,
      memberIndex,
      createNewMember,
      editFunctions,
      // setDeletePanding,
      // onChangeData,
      // resetEdit, saveEdit, deleteMember, cancelEdit,
      setDispStart,
      setSortProp,
    } = this.props;

    var list = allList.slice(dispStart, dispStart + dispLength);

    var members = list.map(member => {
      var showMemberStatus =
        member.memberStatus !== 'Member' && member.memberStatus !== 'OK';
      let subsStatus = member.subsStatus.status;
      let clss = classnames(
        'list-line',
        ([member.memberStatus]: true),
        { current: activeMemberId === member.memberId },
        member.suspended ? 'suspended' : subsStatus,
      );
      // logit('classes', this.props.membersList.status)
      return (
        <div
          key={member._id}
          className={clss}
          onClick={() => setActiveMember(member.memberId, dispStart)}
        >
          <span className="line-name">
            <span className="id">{member._id.substr(1)}</span>
            <span className="name">{member.lastName + ', ' + member.firstName}</span>
          </span>
          <span className="member-status">
            {showMemberStatus ? `(${member.memberStatus})` : ''}
          </span>
        </div>
      );
    });

    var index = memberIndex.key.map(([disp, key, start], i, idx) => {
      let value = start;
      let end = i < idx.length - 1 ? idx[i + 1][2] - 1 : allList.length - 1;
      let seeStart = start >= dispStart && start < dispStart + dispLength;
      let seeEnd = end >= dispStart && end < dispStart + dispLength;
      let partVisible = seeStart || seeEnd;
      let allVisible = seeStart && seeEnd;
      let cl = classnames({ indexItem: true, partVisible, allVisible });
      return (
        <div className={cl} onClick={() => setDispStart(value)} key={'mem:index:' + key}>
          {disp}
        </div>
      );
    });
    const pageDown = () => {
      setDispStart(Math.min(dispStart + dispLength, allList.length - 0.5 * dispLength));
    };
    const pageUp = () => {
      setDispStart(Math.max(dispStart - dispLength, 0));
    };
    var title = <h4>Membership Lists</h4>;
    return (
      <Panel header={title} className="member-list" id="steds_memberlist">
        {/* <div className="list-index" hidden={editMode}> */}
        <div className="sort-buttons" hidden={editMode}>
          <TooltipButton
            key="name"
            className={sortProp === 'name' ? 'active' : ''}
            onClick={() => setSortProp('name')}
          >
            sort by Name
          </TooltipButton>
          <TooltipButton
            key="number"
            className={sortProp === 'id' ? 'active' : ''}
            onClick={() => setSortProp('id')}
          >
            sort by Number
          </TooltipButton>
        </div>
        <div className="index" hidden={editMode}>
          <div>
            <Icon name="page-up" onClick={pageUp} />
          </div>
          {index}
          <div>
            <Icon name="page-down" onClick={pageDown} />
          </div>
        </div>
        <div className="names" hidden={editMode}>
          {members}
        </div>
        <EditMemberData
          className="details"
          {...{
            editMember,
            editMode,
            newMember,
            ...editFunctions,
            setEditMode,
            membersAdmin,
          }}
          onSubmit={showResults}
          onRequestHide={() => setEditMode(false)}
          style={{ minHeight: '100%' }}
        />

        <span className="action-buttons" hidden={editMode}>
          {/* <PrintButton  onClick={()=>summaryReport(printFull)} overlay={printFull ? 'F' : 'W'} onContextMenu={togglePrint} tiptext="Print All  Walks PDF" visible/> */}
          <PrintButton
            onClick={() => membershipListReport(allList)}
            placement="right"
            tiptext={`Print Membership List (Sorted by ${sortProp})`}
          />
          {/* <PrintButton report='memberslist' payload={allList} placement='right' tiptext={`Print Membership List (Sorted by ${sortProp})`} /> */}
          <TooltipButton
            icon="user-add"
            onClick={() => createNewMember()}
            tiptext="Create a New Member"
            visible
          />
        </span>
      </Panel>
    );
  }
}

export default Memberslist;
