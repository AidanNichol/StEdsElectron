import _ from 'lodash';
import React from 'react';
import Select from 'react-select';
const Member = require('../../../mobx/Member.js');

import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import classnames from 'classnames';

import TooltipButton from '../../utility/TooltipButton';
import TextInput from 'react-textarea-autosize';

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
      // let mem = eMem.toObject;
      this.state = {
        dirty: false,
        newMember: (props.editMember || {}).newMember,
        editMode: (props.editMember || {}).newMember,
        deletePending: false,
        bacs: false,
        member: mem || {},
        subsStatus: Member.getSubsStatus(mem.memberStatus, mem.subscription),
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
      let {
        // firstName, lastName, memberStatus, suspended, deletePending,
        // editMode,
        // dirty,
        membersAdmin,
        // editMember,
        // resetEdit,
        // saveEdit,
        // deleteMember,
        // cancelEdit,
        // setEditMode,
        // onChangeData,
        // deletePending,
        // bacs,
        // setDeletePending,
        // setBacs,
        // subsDueForYear, __subsStatus,
      } = this.props;
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
        if (['subscription', 'memberStatus'].includes(name)) {
          this.setState(prev => {
            let mem = prev.member;
            return {
              subsStatus: Member.getSubsStatus(mem.memberStatus, mem.subscription),
            };
          });
        }
      };
      const onChangeData = (name, v) => {
        if (this.state.member[name] === v) return;
        this.setState(prev => ({ member: { ...prev.member, [name]: v }, dirty: true }));
      };
      const roleOptions = [
        { label: 'Committee', value: 'committee' },
        { label: 'Tester', value: 'tester' },
        { label: 'No receipt', value: 'no-receipt' },
      ];
      const pickOpt = roles => {
        let vals = _.split(roles || '', /, */);
        return _.filter(roleOptions, opt => _.includes(vals, opt.value));
      };
      class SelectRole extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            roles: pickOpt(props.roles),
            disabled: props.disabled,
          };
          logit('SelectRoles', this.state);
        }
        render() {
          return (
            <div className="section">
              <Select
                isMulti
                onChange={roles => {
                  logit('SelectRoles changed', roles);
                  this.setState({ roles });
                  onChangeData('roles', roles.map(r => r.value).join(','));
                }}
                options={roleOptions}
                isClearable={false}
                isDisabled={this.state.disabled}
                removeSelected
                backspaceRemovesValue={false}
                defaultValue={this.state.roles}
              />
            </div>
          );
        }
      }

      const SubscriptionButton = props => {
        const {
          onChangeData,
          deletePending,
          editMode,
          subsStatus,
          subsPaid,
          subscription,
          bacs,
          setBacs,
          style = {},
          ...other
        } = props;
        style.whiteSpace = 'nowrap';
        if (!editMode || deletePending) return null;
        if (!subsStatus.showSubsButton || subscription === subsStatus.year) return null;
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            <span className="bacs">
              {' '}
              bacs{' '}
              <input
                value={bacs}
                type="checkbox"
                onChange={evt => setBacs(evt.target.checked)}
              />{' '}
            </span>
            <TooltipButton
              label={`Paid £${subsStatus.fee} for ${subsStatus.year}`}
              onClick={() => {
                onChangeData('subscription', subsStatus.year);
                subsPaid(subsStatus.fee, bacs);
              }}
              {...other}
              style={style}
            />
          </span>
        );
      };
      const SuspendButtons = props => {
        const { suspended, deletePending, onChangeData, editMode } = props;
        return (
          <span>
            <TooltipButton
              icon="user-disable"
              onClick={() => onChangeData('suspended', true)}
              tiptext="Suspend this Member"
              visible={editMode && !suspended}
            />
            <TooltipButton
              icon="user-enable"
              onClick={() => onChangeData('suspended', false)}
              tiptext="Unsuspend this Member"
              visible={editMode && !deletePending && suspended}
            />
          </span>
        );
      };
      const DeleteButtons = props => {
        const { deletePending, deleteMember, editMode, suspended } = props;
        if (!suspended) return null;
        return (
          <span>
            {/* {deletePending ?
            <img className="stamp" src="../assets/Deleted Member.svg" /> : null
          } */}
            <TooltipButton
              label="Delete Member"
              onClick={deleteMember}
              tiptext="Permanently Delete Member"
              visible={editMode && deletePending}
            />
            <TooltipButton
              icon="user-undelete"
              onClick={() => setDeletePending(false)}
              tiptext="Clear the Delete Request"
              visible={editMode && deletePending}
            />
            <TooltipButton
              icon="user-delete"
              onClick={() => setDeletePending(true)}
              tiptext="Request Member Deletion"
              visible={editMode && !deletePending}
            />
          </span>
        );
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
      return (
        <Panel
          className={'show-member-details ' + (editMode ? 'editmode' : 'showMode')}
          header={title}
        >
          <div className={clss}>
            <fieldset className="form" disabled={showMode} size={40}>
              <div className="form-line">
                <label className="item-label">firstName</label>
                <input
                  value={vals.firstName}
                  onChange={evt => onChange(evt, 'firstName', properCaseName)}
                  size="35"
                />
              </div>
              <div className="form-line">
                <label className="item-label">lastName</label>
                <input
                  value={vals.lastName}
                  onChange={evt => onChange(evt, 'lastName', properCaseName)}
                  size="35"
                />
              </div>
              <div className="form-line">
                <label className="item-label">address</label>
                <TextInput
                  value={vals.address}
                  onChange={evt => onChange(evt, 'address', properCaseAddress)}
                  cols="34"
                />
              </div>
              <div className="form-line">
                <label className="item-label">phone</label>
                <input
                  value={vals.phone}
                  onChange={evt => onChange(evt, 'phone', normalizePhone)}
                  size="35"
                />
              </div>
              <div className="form-line">
                <label className="item-label">email</label>
                <input
                  value={vals.email}
                  onChange={evt => onChange(evt, 'email')}
                  size="35"
                />
              </div>
              <div className="form-line sub">
                <label className="item-label">mobile</label>
                <input
                  value={vals.mobile}
                  onChange={evt => onChange(evt, 'mobile')}
                  size="35"
                />
              </div>
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
              </div>

              <div className="form-line">
                <label className="item-label">nextOfKin</label>
                <TextInput
                  value={vals.nextOfKin}
                  onChange={evt => onChange(evt, 'nextOfKin', properCaseAddress)}
                  cols="34"
                />
              </div>
              <div className="form-line">
                <label className="item-label">medical</label>
                <input
                  value={vals.medical}
                  onChange={evt => onChange(evt, 'medical')}
                  size="35"
                />
              </div>
              <div className="form-line">
                <label className="item-label">Member Id</label>
                <input
                  value={vals.memberId}
                  onChange={evt => onChange(evt, 'memberId')}
                  disabled
                  size="35"
                />
              </div>
              <div className="form-line">
                <label className="item-label">Account Id</label>
                <input
                  value={vals.accountId}
                  onChange={evt => onChange(evt, 'accountId')}
                  disabled={!newMember}
                  size="35"
                />
              </div>
              <div className="form-line">
                <label className="item-label">Roles</label>
                <SelectRole roles={vals.roles || ''} disabled={showMode} />
              </div>
              <div className="form-line">
                <label className="item-label">Status</label>
                <select
                  value={editMember.memberStatus}
                  onChange={evt => onChange(evt, 'memberStatus')}
                  disabled={!membersAdmin || showMode}
                >
                  <option value="Member">Member</option>
                  <option value="Guest">Guest</option>
                  <option value="HLM">Honary Life Member</option>
                </select>
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
