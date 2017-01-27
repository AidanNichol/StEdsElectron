import React from 'react';
import {connect} from 'react-redux';
import {annotateWalkBookings, annotateCloseDialog} from '../../../ducks/walksDuck.js';
import Logit from '../../../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'Annotate:Bookings');

function Annotate(props){
  var { memId, walkId, dialogOpen, venue, name, text, annotateCloseDialog,annotateWalkBookings } = props;
  logit('props', props);
  if (!dialogOpen) return (<span></span>)
  var annotation = text;
  const save = ()=>{annotateWalkBookings(walkId, memId, annotation )};
  const change = (event)=>{annotation = event.target.value};


  return (
    <div className="logonX">
      Annotate {name} {venue}
      <input defaultValue={text} onChange={change}/>
      <button onClick={annotateCloseDialog}>Cancel</button>
      <button onClick={save}>Save</button>
    </div>
  );

}


function mapDispatchToProps(dispatch) {
  return {
    annotateCloseDialog: (...args) => (dispatch(annotateCloseDialog(...args))),
    annotateWalkBookings: (...args) => (dispatch(annotateWalkBookings(...args))),
  };
}

const mapStateToProps = (state, props) => {
  let {memId, walkId, dialogOpen} = props || {};
  var venue, name, text, thisWalk;
  if (dialogOpen){
    venue = state.walks.list[walkId].venue
    name = state.members[memId].firstName
    thisWalk = state.walks.list[walkId]
    text = (thisWalk.annotations && thisWalk.annotations[memId]) || ''

  }
  logit('mapStateToProps', { memId, walkId, dialogOpen, venue, name, text })
  return { memId, walkId, dialogOpen, venue, name, text }
}

export const AnnotateBooking = connect(
  mapStateToProps,
  mapDispatchToProps
)(Annotate)
