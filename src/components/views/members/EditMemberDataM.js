
import React from 'react';
import {observer} from 'mobx-react';
import {toJS} from 'mobx';
import classnames from 'classnames';

import TooltipButton from 'components/utility/TooltipButton';
import TextInput from 'react-textarea-autosize';

import {Panel} from 'components/utility/AJNPanel'
// import {getSubsStatus} from 'utilities/subsStatus';
import {properCaseName, properCaseAddress, normalizePhone} from 'components/utility/normalizers';

import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'EditMemberData:mobx');


let EditMemberData = observer((props)=>{

    logit('props', props);
    const {
            // firstName, lastName, memberStatus, suspended, deletePending,
            editMode,
            dirty,
            memberAdmin,
            editMember,
            resetEdit, saveEdit, deleteMember, cancelEdit, setEditMode, onChangeData,
            deletePending, bacs, setDeletePending, setBacs
            // subsDueForYear, __subsStatus,
           } = props;
    if (!editMember || editMember._id === 0)return null;
    const {firstName, lastName, subscription, memberStatus, suspended, } = toJS(editMember)||{};

    const onChange= (event, name, normalize)=>{
      const target = event.target;
      var value = target.type === 'checkbox' ? target.checked : target.value;
      logit('handleInputChange', name, target.value)
      if (normalize)value = normalize(value);
      onChangeData(name, value);

    }

    const SubscriptionButton = (props)=>{
      const { onChangeData, deletePending, editMode, subsStatus, subsPaid, subscription, bacs, setBacs, style={}, ...other } = props;
      style.whiteSpace = 'nowrap';
      return ( (editMode && !deletePending && subsStatus.showSubsButton && subscription !== subsStatus.year) &&
      <span style={{whiteSpace: 'nowrap'}}>
        <span className="bacs"> bacs <input value={bacs} type="checkbox" onChange={(evt)=>setBacs(evt.target.checked)} /> </span>
        <TooltipButton label={`Paid £${subsStatus.fee} for ${subsStatus.year}`}
          onClick={()=>{onChangeData('subscription', subsStatus.year); subsPaid(subsStatus.fee, bacs);}}
          {...other}
          style={style} />
      </span>
      )

    }
    const SuspendButtons = (props)=>{
      const { suspended, deletePending, onChangeData, editMode } = props
      return (
        <span>
          <TooltipButton icon="user-disable" onClick={()=>onChangeData('suspended', true)} tiptext='Suspend this Member' visible={editMode && !suspended} />
          <TooltipButton icon="user-enable" onClick={()=>onChangeData('suspended', false)} tiptext="Unsuspend this Member" visible={editMode && (!deletePending) && suspended} />
        </span>
      )

    }
    const DeleteButtons = (props)=>{
      const {  deletePending, deleteMember, editMode, suspended } = props
      if (!suspended) return null;
      return (
        <span>
          {/* {deletePending ?
            <img className="stamp" src="../assets/Deleted Member.svg" /> : null
          } */}
          <TooltipButton label="Delete Member" onClick={deleteMember} tiptext="Permanently Delete Member" visible={editMode && deletePending} />
          <TooltipButton icon="user-undelete" onClick={()=>setDeletePending(false)} tiptext='Clear the Delete Request' visible={editMode && deletePending}/>
          <TooltipButton icon="user-delete" onClick={()=>setDeletePending(true)} tiptext="Request Member Deletion" visible={editMode && (!deletePending)} />
        </span>
      )

    }

    var showMode = !editMode;

    // var subsPaid = (fee, bacs)=>change(props.form, '_subspaid', fee, bacs);
    var subsPaid = (fee, bacs)=>{};
    const subsStatus = editMember.subsStatus; // {due: true, year: 2016, fee: 15, status: 'late'}
    var showSubs = null;
    if (subsStatus.status !== 'OK')showSubs = <span className='subsStatus'>subsStatus.status</span>
    var title = (<div style={{width:'100%'}}>
      { firstName } { lastName } {dirty ? '(changed)' : ''}
      <span style={{float: 'right', hidden:!(editMode && dirty), cursor:'pointer'}} className='closeWindow' onClick={()=>setEditMode(false)} >{showMode || dirty?"" :"X"}</span>
    </div>);
    let vals = editMember;
    let clss = classnames({['form-horizontal user-details modal-body ']:true, suspended: suspended, deleted: deletePending},  subsStatus.status, memberStatus).toLowerCase();
    return (
      <Panel className={"show-member-details "+(editMode ? 'editmode' : 'showMode')} header={title}>
        <div className={clss}>
          <fieldset className="form" disabled={showMode} size={40}>
            <div className="form-line">
              <label className="item-label">firstName</label>
              <input value={vals.firstName} onChange={(evt)=>onChange(evt, 'firstName', properCaseName)}  size='35'/>
            </div>
            <div className="form-line">
              <label className="item-label">lastName</label>
              <input value={vals.lastName} onChange={(evt)=>onChange(evt, 'lastName', properCaseName)}  size='35'/>
            </div>
            <div className="form-line">
              <label className="item-label">address</label>
              <TextInput value={vals.address} onChange={(evt)=>onChange(evt, 'address', properCaseAddress)} cols='34' />
            </div>
            <div className="form-line">
              <label className="item-label">phone</label>
              <input value={vals.phone} onChange={(evt)=>onChange(evt, 'phone', normalizePhone)}  size='35'/>
            </div>
            <div className="form-line">
              <label className="item-label">email</label>
              <input value={vals.email} onChange={(evt)=>onChange(evt, 'email')}   size='35'/>
            </div>
            <div className="form-line sub">
              <label className="item-label">mobile</label>
              <input value={vals.mobile} onChange={(evt)=>onChange(evt, 'mobile')} size='35'/>
            </div>
            <div className={"form-line"+(memberStatus==='Guest' || memberStatus==='HLM'?' hidden':'')}>
              <label className="item-label">subscription</label>
              <input value={vals.subscription} onChange={(evt)=>onChange(evt, 'subscription')}  size={5} />
              <SubscriptionButton {...{editMode, deletePending, bacs, setBacs, subsStatus, subscription, subsPaid, onChangeData}} />
            </div>

            <div className="form-line">
              <label className="item-label">nextOfKin</label>
              <TextInput value={vals.nextOfKin} onChange={(evt)=>onChange(evt, 'nextOfKin', properCaseAddress)} cols='34' />
            </div>
            <div className="form-line">
              <label className="item-label">medical</label>
              <input value={vals.medical} onChange={(evt)=>onChange(evt, 'medical')}   size='35'/>
            </div>
            <div className="form-line">
              <label className="item-label">Member Id</label>
              <input value={vals.memberId} onChange={(evt)=>onChange(evt, 'memberId')} disabled  size='35'/>
            </div>
            <div className="form-line">
              <label className="item-label">Account Id</label>
              <input value={vals.accountId} onChange={(evt)=>onChange(evt, 'accountId')} disabled  size='35'/>
            </div>
            <div className="form-line">
              <label className="item-label">Status</label>
              <select value={editMember.memberStatus} onChange={(evt)=>onChange(evt, 'memberStatus')} disabled={!memberAdmin || showMode} >
                <option value="Member">Member</option>
                <option value="Guest">Guest</option>
                <option value="HLM">Honary Life Member</option>
              </select>
            </div>
          </fieldset>
          {deletePending ?
            <img className="stamp" src="../assets/Deleted Member.svg" /> : null
          }
          <div className="edit-buttons">
            <TooltipButton className={memberAdmin ? 'edit-member ' : 'edit-member hidden' } label='Edit' onClick={()=>setEditMode(true)} visible={showMode && memberAdmin} />
            <TooltipButton label='Close' onClick={cancelEdit} visible={editMode && !dirty} />
            <TooltipButton label='Discard' onClick={resetEdit} visible={editMode && dirty && !deletePending} />
            <TooltipButton label="Save" onClick={saveEdit} tiptext="Save All Changes to this Member" visible={editMode && !deletePending && dirty} />
            <SuspendButtons {...{editMode, deletePending, suspended, onChangeData}} />
            <DeleteButtons {...{editMode, suspended, saveEdit, deleteMember, deletePending, onChangeData}} />

          </div>
        {/* </form> */}
        </div>


        </Panel>
      );
})

export default EditMemberData;
