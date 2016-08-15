// // require('sass/watermark.scss');
// import 'sass/editMember.scss';
//
// import React from 'react';
//
// import classnames from 'classnames';
// import R from 'ramda';
// import {titleize} from 'underscore.string';
//
// import TooltipButton from 'utility/TooltipButton';
// var belle = require('belle');
// var TextInput = belle.TextInput;
//
// import { Panel } from 'react-bootstrap';
// import {getSubsDue} from 'utilities/DateUtilities';
// let subsDue = getSubsDue();
//
// import Logit from 'factories/logit.js';
// var logit = Logit('color:yellow; background:cyan;', 'EditMemberData.js');
//
// var changesMade = false;
//
// import 'sass/util.css';
//
// class EditMemberData extends React.Component {
//  constructor(props) {
//     super(props);
//     this.componentWillReceiveProps(this.props);
//   }
//   componentWillReceiveProps(nextProps ){
//     logit('componentWillReceiveProps', nextProps);
//     if (nextProps.member){
//
//       this.state = R.mergeAll([{address: ''}, nextProps.member, {
//         __deleteUser: false,
//         __subsStatus: nextProps.member.subscription === subsDue ? 'OK': 'Due',
//       }]);
//     }
//
//   }
//   saveChanges() {
//     var data = R.pickBy((val, key)=>key.substr(0,2)!='__', this.state);
//     this.props.membersEditSaveChanges({doc: data, origDoc: this.props.member});
//   }
//   Suspend() {
//     this.setState({suspended: true});
//   }
//   Unsuspend() {
//     this.setState({suspended: false});
//   }
//   setRemove() { this.setState({__deleteUser: true, _deleted: true});}
//   clearRemove() { this.setState({__deleteUser: false, _deleted: false});}
//   remove() {
//     this.setState({_delete: true});
//     this.saveChanges();
//   }
//   changesMade() {
//     if (this.state.__deleteUser)return true;
//     // if (!R.equals(this.state.actsForMe, this.props.member.actsForMe)) return true;
//     // if (!R.equals(this.state.jointWith, this.props.member.jointWith)) return true;
//     for(let field of Object.keys(this.props.member)) {
//       if (this.props.member[field] !== this.state[field]) {
//         return true;}
//     }
//     if (this.props.member.suspended !== this.state.suspended) return true;
//     return false;
//   }
//   updateHandler(event){
//     let tgt = event.target,
//         value = event.target.value,
//         fmt = tgt.dataset.fmt;
//     logit('updateHandler', typeof fmt, tgt.getAttribute('data-fmt'), this, event.target.name, event.target.value, value, event.target.dataset);
//     if (fmt )value = this[fmt](value);
//
//     this.setState({[event.target.name]: value});
//   }
//   updateState(field, fn, event) {
//     var value = event.target.value;
//     logit('updateState', field, value, event);
//     this.setState({[field]: fn ? fn.call(this, value) : value});
//   }
//   hideRequest() {
//     changesMade = this.changesMade();
//     if (changesMade){
//       let ret = confirm('You have unsaved changes. OK to discard them'); // eslint-disable-line no-alert
//       if (!ret) return;
//     }
//     logit('hideRequest', this);
//     this.props.setShowEditMemberModal(false);
//   }
//   subsPaid(){
//     this.updateState('subscription', null, subsDue);
//     this.setState({__subsStatus: 'OK'});
//   }
//   properCaseName(name){
//    const lowerCaseNames = ['van', 'de', 'de la', 'de le', 'von', 'van der'];
//     var pcexp, pre,
//       result;
//     pcexp = /^(Mc|.+[ '])?(\w)$/;
//
//     result = pcexp.exec(name);
//     if (result) {
//       pre = result[1];
//       logit('properCaseName', result);
//       if (pre){
//         let pre2 = pre.trim().toLowerCase();
//         logit('properCaseName2', {pre, pre2});
//         if (lowerCaseNames.includes(pre.trim().toLowerCase())) pre = pre.toLowerCase();
//       } else pre = '';
//       return pre + result[2].toUpperCase();
//     }
//     else return name;
//   }
//   properCaseAddress(event) {
//     const addressShortcuts = {Wb: 'Whitley Bay', 'W/b': 'Whitley Bay',
//           Ns: 'North Shields', 'N/s': 'North Shields',
//           Nut: 'Newcastle upon Tyne', 'N/t': 'Newcastle upon Tyne', 'N/c': 'Newcastle upon Tyne',
//           Wal: 'Wallsend', Cul: 'Cullercoats',
//           'M/s': 'Monkseaton', Mon: 'Monkseaton', Mnk: 'Monkseaton',
//           Tyn: 'Tynemouth', Tm: 'Tynemouth', TN: 'Tynemouth', 'T/m': 'Tynemouth'};
//     let result,
//         address = event.target.value,
//         addrLines = address.split('\n'),
//         pcexp = /^([^]*)([abcdefghijklmnoprstuwyz]{1}[abcdefghklmnopqrstuvwxy]?[0-9]{1,2})(\s*)([0-9]{1}[abdefghjlnpqrstuwxyz]{2})$/i;
//     addrLines.forEach((line, index)=>{
//       if ((result = pcexp.exec(line))) line = titleize(result[1]) + result[2].toUpperCase() + " " + result[4].toUpperCase();
//       else {
//         line = titleize(line);
//         if (addressShortcuts[line])line = addressShortcuts[line];
//       }
//       addrLines[index] = line;
//     });
//     this.setState({address: addrLines.join('\n')});
//   }
//
//   render() {
//     logit('props', this.props);
//     if (!this.props.member || !this.props.member._id || !this.props.showEditMemberModal)return  (null);
//     changesMade = this.changesMade();
//     logit('state', changesMade, this.state);
//
//     var link = (prop, fn)=> {return (value)=>this.updateState(prop, fn, value)};
//     var title = (<h2>
//       { this.state.firstName } { this.state.lastName } {changesMade ? '(changed)' : ''}
//         <span style={{float: 'right', hidden:!changesMade}} onClick={()=>this.props.setShowEditMemberModal(false)} >{changesMade?"" :"X"}</span>
//     </h2>);
//
//     var { onRequestHide, memberAdmin, ...other } = this.props;
//     let clss = classnames({suspended: this.state.suspended, deleted: this.state.__deleteUser}, this.state.__subsStatus, this.state.memberStatus).toLowerCase();
//     return (
//       <Panel bsStyle='info' className="show-member-details" header={title}  >
//         <form className={'form-horizontal user-details modal-body ' + clss} name="user-details" autoComplete="off">
//
//           <div className="form-line">
//               <span className="item-label">firstName</span>
//               <input className="item-input" name="firstName" type="text" value={this.state.firstName} onChange={link('firstName', titleize)}/>
//           </div>
//           <div className="form-line">
//               <span className="item-label">lastName</span>
//               <input className="item-input" type="text" value={this.state.lastName} onChange={link('lastName', this.properCaseName)}/>
//           </div>
//           <div className="form-line">
//               <span className="item-label">address</span>
//             <textarea className="item-input" rows={this.state.address.split('\n').length} onBlur={(e)=>this.properCaseAddress(e)} value={this.state.address} onChange={link('address')} />
//           </div>
//           <div className="form-line">
//               <span className="item-label">phone</span>
//               <input className="item-input" type="text" value={this.state.phone} onChange={link('phone')}/>
//           </div>
//           <div className="form-line">
//               <span className="item-label">email</span>
//               <input className="item-input" type="email" value={this.state.email} onChange={link('email')}/>
//           </div>
//           <div className="form-line">
//               <span className="item-label">mobile</span>
//               <input className="item-input" type="text" value={this.state.mobile} onChange={link('mobile')} autoComplete="off"/>
//           </div>
//           <div className="form-line">
//               <span className="item-label">subscription</span>
//               <input className={'item-input ' + this.state.__subsStatus} type="text" value={this.state.subscription} onChange={link('subscription')}/>
//               <TooltipButton lable='Paid' onClick={()=>this.subsPaid()} visible={this.state.__subsStatus !== 'OK'} />
//           </div>
//
//           <div className="form-line">
//               <span className="item-label">nextOfKin</span>
//               <TextInput className="item-input" allowNewLine value={this.state.nextOfKin} onChange={link('nextOfKin')}/>
//           </div>
//           <div className="form-line">
//               <span className="item-label">medical</span>
//               <input className="item-input" type="text" value={this.state.medical} onChange={link('medical')}/>
//           </div>
//           <div className="form-line">
//               <span className="item-label">Member Id</span>
//               <input className="item-input" readOnly="true" type="text" value={this.state.memberId} />
//           </div>
//           <div className="form-line">
//               <span className="item-label">Account Id</span>
//               <input className="item-input" readOnly="true" type="text" value={this.state.account} />
//           </div>
//           <div className="form-line">
//               <span className="item-label">Status</span>
//               <select className="item-input" readOnly={memberAdmin ? false : true} value={this.state.memberStatus} onChange={link('memberStatus')} >
//                   <option value="OK">Member</option>
//                   <option value="Guest">Guest</option>
//                   <option value="HLM">Honary Life Member</option>
//                 </select>
//           </div>
//           {this.state.__deleteUser ?
//             <img className="stamp" src="/images/Deleted Member.svg" /> : null
//           }
//         </form>
//         <TooltipButton lable='Close' onClick={()=>this.props.setShowEditMemberModal(false)} visible={!changesMade} />
//         <TooltipButton lable='Discard' onClick={()=>this.props.setShowEditMemberModal(false)} visible={changesMade && !this.state.__deleteUser} />
//         <TooltipButton img="/images/user-undelete.svg" onClick={()=>this.clearRemove()} tiptext='Clear the Delete Request' visible={this.state.__deleteUser}/>
//         <TooltipButton img="/images/user-disable.svg" onClick={()=>this.Suspend()} tiptext='Suspend this Member' visible={this.state.suspended !== true} />
//         <TooltipButton img="/images/user-enable.svg" onClick={()=>this.Unsuspend()} tiptext="Unsuspend this Member" visible={(!this.state.__deleteUser) && this.state.suspended === true} />
//         <TooltipButton img="/images/user-delete.svg" onClick={()=>this.setRemove()} tiptext="Completely Delete Member" visible={(!this.state.__deleteUser) && this.state.suspended === true} />
//
//         <TooltipButton lable="Delete Member" onClick={()=>this.remove()} tiptext="Permanently Delete Member" visible={this.state.__deleteUser} />
//         <TooltipButton lable="Save" onClick={()=>this.saveChanges()} tiptext="Save All Changes to this Member" visible={!this.state.__deleteUser && changesMade} />
//         </Panel>
//       );}
// }
// EditMemberData.displayName = 'EditMemberData';
//
// export default EditMemberData;
