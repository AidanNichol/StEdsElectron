import React from 'react';
import { observer, inject } from 'mobx-react';
import { observable, action, decorate } from 'mobx';
import Logit from 'logit';
var logit = Logit(__filename);

class uiState {
  isOpen = false;
  booking;
  memId;
  note = '';

  open = (booking, memId, note) => {
    this.booking = booking;
    this.memId = memId;
    this.note = note;
    this.isOpen = true;
  };
  close = () => {
    this.isOpen = false;
  };
}
decorate(uiState, {
  isOpen: observable,
  booking: observable,
  memId: observable,
  note: observable,
  open: action,
  close: action,
});
const dialogState = new uiState();
export const openAnnotationDialog = (booking, memId, note) =>
  dialogState.open(booking, memId, note);

function Annotate(props) {
  var { memId, note, isOpen } = dialogState;
  const { saveAnnotation, venue } = props;
  logit('props', props, dialogState);
  if (!isOpen) return <span />;
  const save = () => {
    saveAnnotation(memId, note);
  };
  const change = event => {
    note = event.target.value;
  };

  return (
    <div className="logonX">
      Annotate {name} {venue}
      <input defaultValue={note} onChange={change} />
      <button onClick={dialogState.close}>Cancel</button>
      <button onClick={save}>Save</button>
    </div>
  );
}
export const AnnotateBooking = inject(store => {
  if (!dialogState.booking) return {};
  logit('inject', store, dialogState);
  const { _id, venue } = dialogState.booking.getWalk();
  const walk = store.WS.walks.get(_id);
  const saveAnnotation = (memId, note) => {
    walk.annotateBooking(dialogState.memId, note);
    dialogState.close();
  };
  // NB we route this request via walk so it knows to update itself to DB
  return { venue, saveAnnotation };
})(observer(Annotate));
