// require('sass/watermark.scss');
import 'sass/editMember.scss';

import * as i from 'icepick';
import React from 'react';
import {reduxForm} from 'redux-form';

import classnames from 'classnames';

import TooltipButton from 'utility/TooltipButton';
var belle = require('belle');
var TextInput = belle.TextInput;

import { Panel, Button } from 'react-bootstrap';
import {getSubsDue} from 'utilities/DateUtilities';
import {properCaseName, properCaseAddress, normalizePhone, normalize} from 'components/utility/normalizers';

import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'EditMemberData');

export const fields= [ "address", "name", "phone", "email", "mobile", "nextOfKin", "medical",
          "memberStatus", "lastName", "firstName" , "account" , "memberId" ,
          "status" , "subscription" , "accountId"] // all the fields in your form


import 'sass/util.css';

class EditMemberData extends React.Component {

  render() {
    logit('props', this.props);
    const { fields: { address, phone, email, mobile, nextOfKin, medical,
              memberStatus, lastName, firstName , memberId, suspended,
              _deleted , subscription , accountId},
            dirty: changesMade,
            showEditMemberModal: editMode, setShowEditMemberModal, membersEditSaveChanges, memberAdmin,
            handleSubmit,
            resetForm,
            initialValues,
            subsDueForYear, __subsStatus,
           } = this.props;
    // const hideRequest = ()=>{
    //   if (changesMade){
    //     let ret = confirm('You have unsaved changes. OK to discard them'); // eslint-disable-line no-alert
    //     if (!ret) return;
    //   }
    //   logit('hideRequest', this);
    //   setShowEditMemberModal(false);
    // };
    const saveChanges = (values)=>{
      logit('saveChanges', values);
      membersEditSaveChanges({doc: values, origDoc: initialValues});
    }
    const saveChangesX = (values)=>{
      logit('saveChangesX', {values, props:this.props});
      handleSubmit(saveChanges);
      membersEditSaveChanges({doc: this.props.values, origDoc: this.props.member});
    }
    if (!memberId.value)return  (null);
    var showMode = !editMode;
    let isSuspended = suspended.value;
    const deletePending = _deleted.value || false;
    var remove = (values)=> {
      // values._delete =  true;
      this.saveChanges(values);
    }

    var title = (<h2>
      { firstName.value } { lastName.value } {changesMade ? '(changed)' : ''}
        <span style={{float: 'right', hidden:!(editMode && changesMade)}} onClick={()=>setShowEditMemberModal(false)} >{showMode || changesMade?"" :"X"}</span>
    </h2>);

    let clss = classnames({suspended: isSuspended, deleted: deletePending},  memberStatus.value).toLowerCase();
    return (
      <Panel bsStyle='info' className={"show-member-details "+(editMode ? 'editmode' : 'showMode')} header={title}  >
        {/*<TooltipButton className={memberAdmin ? 'edit-member' : 'edit-member hidden' } label='Edit' onClick={()=>this.props.setShowEditMemberModal(true)} visible={showMode} />*/}
        <Button bsSize='small' bsStyle='primary' className={memberAdmin ? 'edit-member' : 'edit-member hidden' } visible={showMode} onClick={()=>setShowEditMemberModal(true)} >Edit</Button>
        <form className={'form-horizontal user-details modal-body ' + clss} name="user-details" autoComplete="off">
          <fieldset disabled={showMode}>
          <div className="form-line">
              <span className="item-label">firstName</span>
              <input className="item-input" name="firstName" type="text" {...normalize(firstName, properCaseName)} />
          </div>
          <div className="form-line">
              <span className="item-label">lastName</span>
              <input className="item-input" type="text" {...normalize(lastName, properCaseName)} />
          </div>
          <div className="form-line">
              <span className="item-label">address</span>
            <TextInput className="item-input" allowNewLine  onBlur={(e)=>this.properCaseAddress(e)} {...normalize(address, properCaseAddress)} />
          </div>
          <div className="form-line">
              <span className="item-label">phone</span>
              <input className="item-input" type="text" {...normalize(phone, normalizePhone)} />
          </div>
          <div className="form-line">
              <span className="item-label">email</span>
              <input className="item-input" type="email" {...email} />
          </div>
          <div className="form-line">
              <span className="item-label">mobile</span>
              <input className="item-input" type="text" {...mobile} />
          </div>
          <div className="form-line">
              <span className="item-label">subscription</span>
              <input className={'item-input ' + __subsStatus} type="text" {...subscription} />
              <TooltipButton lable='Paid' onClick={()=>subscription.onChange(subsDueForYear)} visible={editMode && (__subsStatus !== 'OK')} />
          </div>

          <div className="form-line">
              <span className="item-label">nextOfKin</span>
              <TextInput className="item-input" allowNewLine {...nextOfKin} />
          </div>
          <div className="form-line">
              <span className="item-label">medical</span>
              <input className="item-input" type="text" {...medical} />
          </div>
          <div className="form-line">
              <span className="item-label">Member Id</span>
              <input className="item-input" disabled="true" type="text" {...memberId} />
          </div>
          <div className="form-line">
              <span className="item-label">Account Id</span>
              <input className="item-input" disabled="true" type="text" {...accountId} />
          </div>
          <div className="form-line">
              <span className="item-label">Status</span>
              <select className="item-input" disabled={!memberAdmin || showMode} {...memberStatus} >
                  <option value="OK">Member</option>
                  <option value="Guest">Guest</option>
                  <option value="HLM">Honary Life Member</option>
                </select>
          </div>
          </fieldset>
          {deletePending ?
            <img className="stamp" src="/images/Deleted Member.svg" /> : null
          }
        </form>

        <TooltipButton lable='Close' onClick={()=>setShowEditMemberModal(false)} visible={editMode && !changesMade} />
        <TooltipButton lable='Discard' onClick={resetForm} visible={editMode && changesMade && !deletePending} />
        <TooltipButton img="/images/user-undelete.svg" onClick={()=>_deleted.onchange(false)} tiptext='Clear the Delete Request' visible={editMode && deletePending}/>
        <TooltipButton img="/images/user-disable.svg" onClick={()=>suspended.onChange(true)} tiptext='Suspend this Member' visible={editMode && !isSuspended} />
        <TooltipButton img="/images/user-enable.svg" onClick={()=>suspended.onChange(false)} tiptext="Unsuspend this Member" visible={editMode && (!deletePending) && isSuspended} />
        <TooltipButton img="/images/user-delete.svg" onClick={()=>_deleted.onChange(true)} tiptext="Completely Delete Member" visible={editMode && (!deletePending) && isSuspended} />

        <TooltipButton lable="Delete Member" onClick={()=>handleSubmit(remove)} tiptext="Permanently Delete Member" visible={editMode && deletePending} />
        <TooltipButton lable="Save" onClick={saveChangesX} tiptext="Save All Changes to this Member" visible={editMode && !deletePending && changesMade} />
        </Panel>
      );}
}

const mapStateToProps = function mapStateToProps(state, props){
  let subsDue = getSubsDue();
  let  {member, other} = props;
  member = member ? i.thaw(member) : {};
  if (member && !('suspended' in member))member.suspended = false;
  // {showEditMemberModal, setShowEditMemberModal, membersEditSaveChanges, memberAdmin} //other
  return {
    initialValues: member, // will pull state into form's initialValues
    subsDueForYear: subsDue,
    __subsStatus: member && member.subscription === subsDue ? 'OK': 'Due',
    __subsDue: !(member && member.subscription === subsDue ),
    ...other,
    member,

  }
}
export default reduxForm({ // <----- THIS IS THE IMPORTANT PART!
  form: 'EditMemberData',                           // a unique name for this form
  fields: [ "address", "name", "phone", "email", "mobile", "nextOfKin", "medical",
            "memberStatus", "lastName", "firstName" , "account" , "memberId" ,
            '_id', '_rev', 'type',
            "_deleted", "suspended" , "subscription" , "accountId"] // all the fields in your form
},
mapStateToProps,
)(EditMemberData);
