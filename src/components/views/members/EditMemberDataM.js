import React from 'react';
import { Member } from '@steds/store';
import AccountMembers from './AccountMembers';
import SelectRole from './SelectRole';
import SubscriptionButton from './SubscriptionButton';
import SuspendButtons from './SuspendButtons';
import FormLine from './FormLine';
import ff from './WrappedFormFields';

import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import classnames from 'classnames';

import TooltipButton from '../../utility/TooltipButton';

import { Panel } from '../../utility/AJNPanel';
import {
  properCaseName,
  properCaseAddress,
  normalizePhone,
} from '../../utility/normalizers';

import Logit from '@steds/logit';
var logit = Logit(__filename);

const EditMemberData = observer(
  class EditMemberData extends React.Component {
    constructor(props) {
      super(props);
      let { showState, ...mem } = (props.editMember || {}).toObject || {};
      let subsStatus = Member.getSubsStatus(mem.memberStatus, mem.subscription);
      this.state = {
        dirty: false,
        newMember: (props.editMember || {}).newMember,
        editMode: (props.editMember || {}).newMember,
        showState,
        bacs: false,
        member: mem,
        subsStatus: subsStatus,
      };
      this.discardChanges = this.discardChanges.bind(this);
      this.setEditMode = this.setEditMode.bind(this);
      this.setDeletePending = this.setDeletePending.bind(this);
      this.setBacs = this.setBacs.bind(this);
      this.saveChanges = this.saveChanges.bind(this);
      this.deleteMember = this.deleteMember.bind(this);
      logit('props&state', props, this.state);
    }
    saveChanges() {
      this.setEditMode(false);
      this.props.saveEdit(this.state.member);
    }
    deleteMember() {
      this.setEditMode(false);
      this.props.deleteMember();
    }
    discardChanges() {
      this.setState({ member: this.props.editMember, dirty: false });
    }
    setEditMode(v) {
      if (this.state.editMode !== v) this.setState({ editMode: v });
    }
    setDeletePending(bool) {
      if (this.state.deletePending !== bool) this.setState({ deletePending: bool });
    }
    setBacs(bool) {
      if (this.state.bacs !== bool) this.setState({ bacs: bool });
    }

    render() {
      let { membersAdmin } = this.props;
      let editMember = this.state.member;
      if (!this.props.editMember || this.props.editMember._id === 0) return null;
      const { firstName, lastName, subscription, memberStatus, suspended } =
        toJS(editMember) || {};

      const onChangeData = (name, v) => {
        logit('onChangeData', name, v, this.state.member);
        if (this.state.member[name] === v) return; // unchanged
        const mem = { ...this.state.member, [name]: v };
        this.setState({ member: mem, dirty: true });
        if (['subscription', 'memberStatus', 'deleteState'].includes(name)) {
          const subsStatus = Member.getSubsStatus(mem.memberStatus, mem.subscription);
          const showState = Member.getShowState(subsStatus.status, mem.deleteState);
          this.setState(() => ({ subsStatus, showState }));
          logit('onChangeData', name, v, mem, subsStatus, showState, this.state);
        }
      };
      const deleteMember = this.deleteMember;

      var showMode = !this.state.editMode;

      var subsPaid = (fee, bacs) => {
        logit('subsPaid', { fee, bacs });
      };
      const { editMode, dirty, deletePending, bacs, newMember, showState } = this.state;
      const subsStatus = this.state.subsStatus || {}; // {due: true, year: 2016, fee: 15, status: 'late'}
      // if (subsStatus.status !== 'OK')
      var title = (
        <div style={{ width: '100%' }}>
          {firstName} {lastName} {dirty ? '(changed)' : ''}
          <span
            style={{
              float: 'right',
              hidden: !(editMode && dirty),
              cursor: 'pointer',
            }}
            className="closeWindow"
            onClick={() => this.setEditMode(false)}
          >
            {showMode || dirty ? '' : 'X'}
          </span>
        </div>
      );
      let vals = editMember;
      const delSettings =
        {
          D: { text: 'Subs Due', style: { '--color': 'green' } },
          G: { text: 'Guest', style: { '--color': 'blue' } },
          L: { text: 'Subs Late', style: { '--color': 'red' } },
          S: { text: 'Suspended', style: { '--color': 'black' } },
          X: { text: 'Delete Me', style: { '--color': 'red' } },
        }[showState] || {};
      let clss = classnames(
        {
          ['form-horizontal user-details modal-body ']: true,
          suspended: suspended,
          deleted: deletePending,
        },
        subsStatus.status,
        memberStatus,
      ).toLowerCase();
      logit('showState', this.state, showState, delSettings);
      if (!this.props.editMember._id) return null;
      const memOpts = { Member: 'Member', Guest: 'Guest', HLM: 'Honary Life Member' };
      const base = { onChangeData, vals, disabled: !editMode };
      const input = { ...base, Type: ff.Input };
      const textarea = { ...base, Type: ff.Textarea };
      const select = { ...base, Type: ff.Select, options: {} };
      const special = { ...base, Type: 'special' };
      return (
        <Panel
          className={'show-member-details ' + (editMode ? 'editmode' : 'showMode')}
          header={title}
        >
          <div className={clss} {...delSettings}>
            <div className="form">
              <FormLine name="firstName" normalize={properCaseName} {...input} required />
              <FormLine name="lastName" normalize={properCaseName} {...input} required />
              <FormLine name="address" normalize={properCaseAddress} {...textarea} />
              <FormLine name="phone" normalize={normalizePhone} {...input} />
              <FormLine name="email" {...input} />
              <FormLine name="mobile" {...input} />

              <FormLine
                name="subscription"
                className="sub"
                {...input}
                hidden={['Guest', 'HLM'].includes(memberStatus)}
              >
                <SubscriptionButton
                  {...{
                    editMode,
                    showState,
                    bacs,
                    setBacs: this.setBacs,
                    subsStatus: this.state.subsStatus,
                    subscription,
                    subsPaid,
                    onChangeData,
                  }}
                />
              </FormLine>
              <FormLine name="memberStatus" {...select} options={memOpts} />
              <FormLine name="nextOfKin" {...textarea} />
              <FormLine name="medical" {...textarea} />

              <FormLine name="roles" {...special} Type={SelectRole} />
              <FormLine name="memberId" {...input} disabled />

              <div>
                <FormLine name="accountId" {...input} disabled={!newMember}>
                  <AccountMembers
                    id={vals.accountId}
                    memId={vals.memberId}
                    accId={vals.accountId}
                    editMode={editMode}
                  />
                </FormLine>
              </div>
            </div>
            {showState === 'X' ? (
              <img className="stamp" src="../assets/Deleted Member.svg" />
            ) : null}
            <div className="edit-buttons">
              <TooltipButton
                className={membersAdmin ? 'edit-member ' : 'edit-member hidden'}
                label="Edit"
                onClick={() => this.setEditMode(true)}
                visible={showMode && membersAdmin}
              />
              <TooltipButton
                label="Close"
                onClick={() => this.setEditMode(false)}
                visible={editMode && !dirty}
              />
              <TooltipButton
                label="Discard"
                onClick={this.discardChanges}
                visible={editMode && dirty && !deletePending}
              />
              <TooltipButton
                label="Save"
                onClick={this.saveChanges}
                tiptext="Save All Changes to this Member"
                visible={editMode && !deletePending && dirty}
              />
              <SuspendButtons {...{ editMode, showState, onChangeData, deleteMember }} />
            </div>
            {/* </form> */}
          </div>
        </Panel>
      );
    }
  },
);

export default EditMemberData;
