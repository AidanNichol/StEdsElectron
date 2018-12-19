// import _ from 'lodash';
import React from 'react';
// import Select from 'react-select';
const Member = require('../../../mobx/Member.js');
import AccountMembers from './AccountMembers';
import SelectRole from './SelectRole';
import SubscriptionButton from './SubscriptionButton';
import DeleteButtons from './DeleteButtons';
import SuspendButtons from './SuspendButtons';
import FormLine from './FormLine';
import ff from './WrappedFormFields';

import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import classnames from 'classnames';

import TooltipButton from '../../utility/TooltipButton';
// import TextInput from 'react-textarea-autosize';

import { Panel } from '../../utility/AJNPanel';
// import {getSubsStatus} from 'utilities/subsStatus';
import {
  properCaseName,
  properCaseAddress,
  normalizePhone,
} from '../../utility/normalizers';

import Logit from 'logit';
var logit = Logit(__filename);

const EditMemberData = observer(
  class EditMemberData extends React.Component {
    constructor(props) {
      super(props);
      let mem = (props.editMember || {}).toObject || {};
      let subsStatus = Member.getSubsStatus(mem.memberStatus, mem.subscription);
      mem.deleteState = subsStatus.status === 'ok' ? '' : subsStatus.status[0];
      if (mem.suspended && mem.deleteState < 'S') mem.deleteState = 'S';
      // let mem = eMem.toObject;
      this.state = {
        dirty: false,
        newMember: (props.editMember || {}).newMember,
        editMode: (props.editMember || {}).newMember,
        deletePending: false,
        bacs: false,
        member: mem || {},
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

      const onChange = (event, name, normalize) => {
        const target = event.target;
        var value = target.type === 'checkbox' ? target.checked : target.value;
        logit('handleInputChange', name, target.value);
        if (normalize) value = normalize(value);
        onChangeData(name, value);
      };
      const onChangeData = (name, v) => {
        if (this.state.member[name] === v) return; // unchanged
        this.setState(prev => ({ member: { ...prev.member, [name]: v }, dirty: true }));
        if (['subscription', 'memberStatus'].includes(name)) {
          let mem = this.state.member;
          const subsStatus = Member.getSubsStatus(mem.memberStatus, mem.subscription);
          this.setState(() => ({ subsStatus }));
        }
      };

      var showMode = !this.state.editMode;

      // var subsPaid = (fee, bacs)=>change(props.form, '_subspaid', fee, bacs);
      var subsPaid = (fee, bacs) => {
        logit('subsPaid', { fee, bacs });
      };
      // let showSubs = null;
      const { editMode, dirty, deletePending, bacs, newMember } = this.state;
      const { setDeletePending, setEditMode } = this;
      const subsStatus = this.state.subsStatus || {}; // {due: true, year: 2016, fee: 15, status: 'late'}
      if (subsStatus.status !== 'OK')
        // showSubs = <span className="subsStatus">subsStatus.status</span>;
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
      let clss = classnames(
        {
          ['form-horizontal user-details modal-body ']: true,
          suspended: suspended,
          deleted: deletePending,
        },
        subsStatus.status,
        memberStatus,
      ).toLowerCase();
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
          <div className={clss}>
            <fieldset className="form" disabled={showMode} size={40}>
              <FormLine name="firstName" normalize={properCaseName} {...input} />
              <FormLine name="lastName" normalize={properCaseName} {...input} />
              <FormLine name="address" normalize={properCaseAddress} {...input} />
              <FormLine name="phone" normalize={normalizePhone} {...input} />
              <FormLine name="email" {...input} />
              <FormLine name="mobile" {...input} className="sub" />

              <FormLine
                name="subscription"
                className="sub"
                {...input}
                hidden={['Guest', 'HLM'].includes(memberStatus)}
              >
                <SubscriptionButton
                  {...{
                    editMode,
                    deletePending,
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
              <div
                className={
                  'form-line' +
                  (memberStatus === 'Guest' || memberStatus === 'HLM' ? ' hidden' : '')
                }
              >
                <label className="item-label">subscription</label>
                <input
                  value={vals.subscription}
                  onChange={evt => onChange(evt, 'subscription')}
                  size={5}
                />
              </div>
              <FormLine name="nextOfKin" {...textarea} />
              <FormLine name="medical" {...textarea} />

              <FormLine name="roles" {...special} Type={SelectRole} />
              <FormLine name="memberId" {...input} disabled />

              <div className="account-box">
                <FormLine name="accountId" {...input} disabled={!newMember} />
                <AccountMembers id={vals.accountId} className="account-edit" />
              </div>
            </fieldset>
            {deletePending ? (
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
              <SuspendButtons {...{ editMode, deletePending, suspended, onChangeData }} />
              <DeleteButtons
                {...{
                  editMode,
                  suspended,
                  saveEdit: this.saveEdit,
                  deleteMember: this.deleteMember,
                  deletePending,
                  onChangeData,
                  setDeletePending,
                  setEditMode,
                }}
              />
            </div>
            {/* </form> */}
          </div>
        </Panel>
      );
    }
  },
);

export default EditMemberData;
