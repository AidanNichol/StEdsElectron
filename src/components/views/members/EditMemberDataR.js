
import * as i from 'icepick';
import React from 'react';
import {Field, reduxForm, formValueSelector, getFormValues, isDirty, change} from 'redux-form';
import {connect} from 'react-redux';
// import {Icon} from '../../Utility/Icon'
import classnames from 'classnames';

import TooltipButton from '../../utility/TooltipButton';
import TextInput from 'react-textarea-autosize';

import {Panel} from '../../utility/AJNPanel'
import {getSubsStatus} from '../../../utilities/subsStatus'
import {properCaseName, properCaseAddress, normalizePhone} from '../../utility/normalizers';

import Logit from '../../../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'EditMemberData');

let renderField = (field) => {
  console.log('renderField', field);
  const {input, meta, children, size, name, className='', ...other} = field;
  return (
    <span className={"item-input "+name+' '+className}>
      <input {...field.input} size={field.size? 1*field.size: 35} type="text" {...other}/>
      {field.children||null}
      {field.meta.touched && field.meta.error &&
       <span className="error">{field.meta.error}</span>}
    </span>
  )
}
let renderTextArea = (field) => {
  const {input, meta, children, size, name, className, ...other} = field;
  return(
    <span className={"item-input "+name+' '+className||''}>
      <TextInput {...field.input} type="text" cols={field.cols||34} {...other}/>
      {field.meta.touched && field.meta.error &&
       <span className="error">{field.meta.error}</span>}
    </span>
  )
}

const subscriptionButton = (props)=>{
  const { input: {  onChange}, _delete, editMode, subsStatus, subsPaid, subscription, _bacs, meta, style={}, ...other } = props;
  // if (!subsStatus.due) return null;
  // style.marginLeft = 80;
  style.whiteSpace = 'nowrap';
  // logit('subscriptionButton',{ _delete, editMode, subsStatus, other})
  // const change = ()=>{
  //   onChange(subsStatus.year);
  //   subsPaid(subsStatus.fee);
  // }
  return ( (editMode && !_delete && subsStatus.showSubsButton && subscription !== subsStatus.year) &&
    <span style={{whiteSpace: 'nowrap'}}>
      <span className="bacs"> bacs <Field name="_bacs" component="input" type="checkbox"/> </span>
      <TooltipButton label={`Paid £${subsStatus.fee} for ${subsStatus.year}`}
      onClick={()=>{onChange(subsStatus.year); subsPaid(subsStatus.fee, _bacs);}}
      {...other}
      style={style} />
      {/* // visible={editMode && !_delete && subsStatus.due} /> */}
    </span>
  )

}
const suspendButtons = (props)=>{
  const { input: { value:suspended, onChange}, _delete,  editMode } = props
  return (
    <span>
    <TooltipButton icon="user-disable" onClick={()=>onChange(true)} tiptext='Suspend this Member' visible={editMode && !suspended} />
    <TooltipButton icon="user-enable" onClick={()=>onChange(false)} tiptext="Unsuspend this Member" visible={editMode && (!_delete) && suspended} />
    </span>
  )

}
const deleteButtons = (props)=>{
  const { input: { value: deleteMe, onChange}, editMode, suspended, remove } = props
  if (!suspended) return null;
  return (
    <span>
    {/* {deleteMe ?
      <img className="stamp" src="../assets/Deleted Member.svg" /> : null
    } */}
    <TooltipButton label="Delete Member" onClick={remove} tiptext="Permanently Delete Member" visible={editMode && deleteMe} />
    <TooltipButton icon="user-undelete" onClick={()=>onChange(false)} tiptext='Clear the Delete Request' visible={editMode && deleteMe}/>
    <TooltipButton icon="user-delete" onClick={()=>onChange(true)} tiptext="Request Member Deletion" visible={editMode && (!deleteMe)} />
    </span>
  )

}

let EditMemberData = (props)=>{

    logit('props', props);
    const {
            // firstName, lastName, memberStatus, suspended, _delete,
            showEditMemberModal: editMode,
            dirty,
            setShowEditMemberModal, membersEditSaveChanges, memberAdmin,
            handleSubmit,
            reset,
            formValues,
            newMember,
            // subsDueForYear, __subsStatus,
           } = props;
    const {firstName, lastName, subscription, memberStatus, suspended, _delete, _bacs} = formValues||{};

    const saveChangesX = (values)=>{
      logit('saveChangesX', {values, props});
      // handleSubmit(saveChanges);
      let res = membersEditSaveChanges({doc: props.formValues, origDoc: props.member});
      logit('save result', res)
    }

    if (!props.member.memberId)return  (null);
    var showMode = !editMode;
    const deletePending = _delete || false;
    var remove = ()=> {
      const doc = {...props.formValues, _deleted: true}
      membersEditSaveChanges({doc, origDoc: props.member});

    }
    var subsPaid = (fee, bacs)=>props.dispatch(change(props.form, '_subspaid', fee, bacs));
    const subsStatus = getSubsStatus({subscription, memberStatus}); // {due: true, year: 2016, fee: 15, status: 'late'}
    var title = (<div style={{width:'100%'}}>
      { firstName } { lastName } {dirty ? '(changed)' : ''}
        <span style={{float: 'right', hidden:!(editMode && dirty), cursor:'pointer'}} className='closeWindow' onClick={()=>setShowEditMemberModal(false)} >{showMode || dirty?"" :"X"}</span>
    </div>);

    let clss = classnames({['form-horizontal user-details modal-body ']:true, suspended: suspended, deleted: _delete},  memberStatus).toLowerCase();
    return (
      <Panel className={"show-member-details "+(editMode ? 'editmode' : 'showMode')} header={title}>
        <div className={clss}>
          <TooltipButton className={memberAdmin ? 'edit-member ' : 'edit-member hidden' } label='Edit' onClick={()=>setShowEditMemberModal(true)} visible={showMode && memberAdmin} />
          <fieldset className="form" disabled={showMode} size={40}>
            <div className="form-line">
              <label className="item-label">firstName</label>
              <Field component={renderField} name="firstName" type="text" normalize={properCaseName} />
            </div>
            <div className="form-line">
              <label className="item-label">lastName</label>
              <Field component={renderField} name='lastName' type="text" normalize={properCaseName} />
            </div>
            <div className="form-line">
              <label className="item-label">address</label>
              <Field component={renderTextArea} name="address" normalize={properCaseAddress} />
            </div>
            <div className="form-line">
              <label className="item-label">phone</label>
              <Field component={renderField} name='phone' type="text" normalize={normalizePhone} />
            </div>
            <div className="form-line">
              <label className="item-label">email</label>
              <Field component={renderField} name='email' type="email"  />
            </div>
            <div className="form-line sub">
              <label className="item-label">mobile</label>
              <Field component={renderField} name='mobile' type="text"/>
            </div>
            <div className={"form-line"+(memberStatus==='Guest' || memberStatus==='HLM'?' hidden':'')}>
              <label className="item-label">subscription</label>
              <Field component={renderField} name="subscription" className={subsStatus.status} type="text"  size={5}>
                <Field component={subscriptionButton} name='subscription' {...{editMode, _delete, _bacs, subsStatus, subscription, subsPaid}} />
              </Field>
            </div>

            <div className="form-line">
              <label className="item-label">nextOfKin</label>
              <Field component={renderTextArea} name="nextOfKin" />
            </div>
            <div className="form-line">
              <label className="item-label">medical</label>
              <Field component={renderField} name="medical" type="text"  />
            </div>
            <div className="form-line">
              <label className="item-label">Member Id</label>
              <Field name="memberId" component={renderField} disabled type="text"  />
            </div>
            <div className="form-line">
              <label className="item-label">Account Id</label>
              <Field component={renderField} name="accountId" disabled type="text"  />
          </div>
          <div className="form-line">
              <label className="item-label">Status</label>
              <Field component='select' name='memberStatus' disabled={!memberAdmin || showMode} >
                  <option value="Member">Member</option>
                  <option value="Guest">Guest</option>
                  <option value="HLM">Honary Life Member</option>
                </Field>
          </div>
          </fieldset>
          {_delete ?
            <img className="stamp" src="../assets/Deleted Member.svg" /> : null
          }
          <div className="edit-buttons">
            <TooltipButton label='Close' onClick={()=>setShowEditMemberModal(false)} visible={editMode && !dirty} />
            <TooltipButton label='Discard' onClick={reset} visible={editMode && dirty && !deletePending} />
            <TooltipButton label="Save" onClick={saveChangesX} tiptext="Save All Changes to this Member" visible={editMode && !_delete && dirty} />
            <Field component={suspendButtons} name='suspended' {...{editMode, _delete, suspended}} />
            <Field component={deleteButtons} name='_delete' {...{editMode, suspended, handleSubmit, remove}} />

          </div>
        {/* </form> */}
        </div>


        </Panel>
      );
}
const selector = formValueSelector('EditMemberData');
const mapStateToProps = function mapStateToProps(state, props){
  // let subsDue = getSubsDue();
  // let subsLate = getSubsLate();
  let  {member, other, newMember} = props;
  const formValues = getFormValues('EditMemberData')(state);
  // const subs = ( formValues && formValues.subscription) || member.subscription;
  member = member ? i.thaw(member) : {};
  if (member && !('suspended' in member))member.suspended = false;
  const newProps = {
    initialValues: {_delete:false, _subspaid: 0, _bacs: false, ...member}, // will pull state into form's initialValues
    enableReinitialize: true,
    newMember,
    ...other,
    member,
    formValues,
    dirty: isDirty('EditMemberData')(state),
    ...selector(state, 'firstName', 'lastName', 'suspended', '_delete'),
  };
  logit('mapStateToProps', {state, props, newProps})
  return newProps;
}
EditMemberData = reduxForm({ // <----- THIS IS THE IMPORTANT PART!
  form: 'EditMemberData',                           // a unique name for this form
}
)(EditMemberData);
EditMemberData = connect(
  mapStateToProps
)(EditMemberData)

export default EditMemberData;
