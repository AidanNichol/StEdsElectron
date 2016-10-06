// require('less/watermark.scss');

import * as i from 'icepick';
import React from 'react';
import {Field, reduxForm, formValueSelector, getFormValues, isDirty} from 'redux-form';
import {connect} from 'react-redux';

import classnames from 'classnames';

import TooltipButton from '../../utility/TooltipButton.js';
// var belle = require('belle');
// var TextInput = belle.TextInput;
import TextInput from 'react-textarea-autosize';

// import {Panel, PanelHeader} from 'rebass';
// import {Panel} from 'react-bootstrap';
import {Panel} from '../../utility/AJNPanel'
import {getSubsDue, getSubsLate} from '../../../utilities/DateUtilities.js';
import {properCaseName, properCaseAddress, normalizePhone} from '../../utility/normalizers.js';

import Logit from '../../../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'EditMemberData');

// export const fields= [ "address", "name", "phone", "email", "mobile", "nextOfKin", "medical",
//           "memberStatus", "lastName", "firstName" , "account" , "memberId" ,
//           "status" , "subscription" , "accountId"] // all the fields in your form


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
// renderField='input';
const subscriptionButton = (props)=>{
  const { input: {  value: subsCurrent, onChange}, _delete, editMode, subsDueForYear, meta, style={}, ...other } = props;
  style.marginLeft = 225;
  console.log('subscriptionButton',{ _delete, editMode, subsDueForYear, other})
  return (
    <TooltipButton label='Paid' onClick={()=>onChange(subsDueForYear)} {...other} style={style} tiptext={'subs paid for '+subsDueForYear} visible={editMode && !_delete && (subsCurrent !== subsDueForYear)} />
  )

}
const suspendButtons = (props)=>{
  const { input: { value:suspended, onChange}, _delete,  editMode } = props
  return (
    <span>
    <TooltipButton img="/images/user-disable.svg" onClick={()=>onChange(true)} tiptext='Suspend this Member' visible={editMode && !suspended} />
    <TooltipButton img="/images/user-enable.svg" onClick={()=>onChange(false)} tiptext="Unsuspend this Member" visible={editMode && (!_delete) && suspended} />
    </span>
  )

}
const deleteButtons = (props)=>{
  const { input: { value: deleteMe, onChange}, editMode, suspended, remove } = props
  if (!suspended) return null;
  return (
    <span>
    <TooltipButton label="Delete Member" onClick={remove} tiptext="Permanently Delete Member" visible={editMode && deleteMe} />
    <TooltipButton img="/images/user-undelete.svg" onClick={()=>onChange(false)} tiptext='Clear the Delete Request' visible={editMode && deleteMe}/>
    <TooltipButton img="/images/user-delete.svg" onClick={()=>onChange(true)} tiptext="Request Member Deletion" visible={editMode && (!deleteMe)} />
    </span>
  )

}
// const Panel = (props)=>(<div className={props.className} style={{boxSizing: 'border-box', padding: 10, marginBottom: 16, border: '1px solid #bce8f1', borderRadius: 2, backgroundColor: 'rgb(255, 255, 255)'}}>{props.children}</div>)
// const PanelHeader = (props)=>(<div className={props.className} style={{boxSizing: 'border-box', fontSize: '2rem', display: 'flex', alignItems: 'center', fontWeight: 600, margin: '-11px -11px 10px', padding: 'inherit', borderRadius: '2px 2px 0 0', color:'#31708f', backgroundColor: '#d9edf7'}}>{props.children}</div>)

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
            subsDueForYear, __subsStatus,
           } = props;
    const {firstName, lastName, memberStatus, suspended, _delete, } = formValues||{};

    // const saveChanges = (values)=>{
    //   logit('saveChanges', values);
    //   membersEditSaveChanges({doc: values, origDoc: props.members});
    // }
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

    var title = (<div style={{width:'100%'}}>
      { firstName } { lastName } {dirty ? '(changed)' : ''}
        <span style={{float: 'right', hidden:!(editMode && dirty), cursor:'pointer'}} className='closeWindow' onClick={()=>setShowEditMemberModal(false)} >{showMode || dirty?"" :"X"}</span>
    </div>);

    let clss = classnames({['form-horizontal user-details modal-body ']:true, suspended: suspended, deleted: _delete},  memberStatus).toLowerCase();
    return (
      <Panel bsStyle='info' className={"show-member-details "+(editMode ? 'editmode' : 'showMode')} header={title}>
        <link rel="stylesheet" href="less/editMember.less" />;
        <TooltipButton className={memberAdmin ? 'edit-member ' : 'edit-member hidden' } label='Edit' onClick={()=>props.setShowEditMemberModal(true)} visible={showMode} />
        <div className={clss}>
          {/* <form className={clss} name="user-details" autoComplete="off" onSubmit={onSubmit} > */}
          <fieldset disabled={showMode} size={40}>
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
          <div className="form-line">
              <label className="item-label">mobile</label>
              <Field component={renderField} name='mobile' type="text"/>
          </div>
          <div className="form-line">
              <label className="item-label">subscription</label>
              <Field component={renderField} name="subscription" className={__subsStatus} type="text"  size={5}>
                <Field component={subscriptionButton} name='subscription' {...{editMode, _delete, subsDueForYear}} />

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
              <Field name="memberId" component={renderField} disabled="true" type="text"  />
          </div>
          <div className="form-line">
              <label className="item-label">Account Id</label>
              <Field component={renderField} name="accountId" disabled="true" type="text"  />
          </div>
          <div className="form-line">
              <label className="item-label">Status</label>
              <Field component='select' name='memberStatus' disabled={!memberAdmin || showMode} >
                  <option value="OK">Member</option>
                  <option value="Guest">Guest</option>
                  <option value="HLM">Honary Life Member</option>
                </Field>
          </div>
          </fieldset>
          <span>
            delete id {_delete?'true':'false'}
            {_delete ?
            <img className="stamp" src="/images/Deleted Member.svg" /> : null
            }
          </span>
          <TooltipButton label='Close' onClick={()=>setShowEditMemberModal(false)} visible={editMode && !dirty} />
          <TooltipButton label='Discard' onClick={reset} visible={editMode && dirty && !deletePending} />
          {/* <button type="submit" disabled={pristine || submitting}>Submit</button> */}
          <TooltipButton label="Save" onClick={saveChangesX} tiptext="Save All Changes to this Member" visible={editMode && !_delete && dirty} />
          {/* <TooltipButton img="/images/user-undelete.svg" onClick={()=>_deleted.onchange(false)} tiptext='Clear the Delete Request' visible={editMode && deletePending}/>
          <TooltipButton img="/images/user-delete.svg" onClick={()=>_deleted.onChange(true)} tiptext="Completely Delete Member" visible={editMode && (!deletePending) && isSuspended} />
          <TooltipButton lable="Delete Member" onClick={()=>handleSubmit(remove)} tiptext="Permanently Delete Member" visible={editMode && deletePending} /> */}
          <Field component={suspendButtons} name='suspended' {...{editMode, _delete, suspended}} />
          <Field component={deleteButtons} name='_delete' {...{editMode, suspended, handleSubmit, remove}} />
          {/* <TooltipButton img="/images/user-disable.svg" onClick={()=>suspended.onChange(true)} tiptext='Suspend this Member' visible={editMode && !isSuspended} />
          <TooltipButton img="/images/user-enable.svg" onClick={()=>suspended.onChange(false)} tiptext="Unsuspend this Member" visible={editMode && (!deletePending) && isSuspended} /> */}
        {/* </form> */}
        </div>


        </Panel>
      );
}
const selector = formValueSelector('EditMemberData');
const mapStateToProps = function mapStateToProps(state, props){
  let subsDue = getSubsDue();
  let subsLate = getSubsLate();
  let  {member, other} = props;
  const formValues = getFormValues('EditMemberData')(state);
  const subs = ( formValues && formValues.subscription) || member.subscription;
  member = member ? i.thaw(member) : {};
  if (member && !('suspended' in member))member.suspended = false;
  const newProps = {
    initialValues: {_delete:false, ...member}, // will pull state into form's initialValues
    subsDueForYear: subsDue,
    __subsStatus: subs === subsDue ? 'OK': (subs <= subsLate? 'Late':'Due'),
    __subsDue: !(member && subs === subsDue ),
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

export default EditMemberData
