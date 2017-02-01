import React from 'react';
import {observer, inject} from 'mobx-react';
import {observable, action} from 'mobx';
// import {connect} from 'react-redux';
// import {annotateWalkBookings, annotateCloseDialog} from '../../../ducks/walksDuck.js';
import Logit from '../../../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'Annotate:Bookings');

class uiState {
  @observable isOpen= false;
  @observable booking;
  @observable memId;
  @observable note='';

  @action open(booking, memId, note){
    this.booking = booking;
    this.memId = memId;
    this.note = note;
    this.isOpen = true;
  }
  @action close = ()=>{
    this.isOpen = false;
  }
}
const dialogState = new uiState();
export const openAnnotationDialog = (booking, memId, note)=>dialogState.open(booking, memId, note);

function Annotate(props){
  var { memId, note, isOpen} = dialogState;
  const {saveAnnotation, venue} = props;
  logit('props', props, dialogState);
  if (!isOpen) return (<span />)
  const save = ()=>{saveAnnotation(memId, note )};
  const change = (event)=>{note = event.target.value};


  return (
    <div className="logonX">
      Annotate {name} {venue}
      <input defaultValue={note} onChange={change}/>
      <button onClick={dialogState.close}>Cancel</button>
      <button onClick={save}>Save</button>
    </div>
  );

}
export const AnnotateBooking = inject((store)=>{
  if (!dialogState.booking)return {};
  logit('inject', store, dialogState)
  const {_id, venue} = dialogState.booking.getWalk();
  const walk = store.WS.walks.get(_id);
  const saveAnnotation = (memId, note)=>{
    walk.annotateBooking(dialogState.memId, note);
    dialogState.close();
  }
  // NB we route this request via walk so it knows to update itself to DB
  return {venue, saveAnnotation}

})(observer(Annotate));
