// import React from 'react';
// import { connect } from 'react-redux';
// import Logit from '../../../factories/logit.js';
// var logit = Logit('color:white; background:red;', 'replication:Duck');
// import {Icon} from '../../utility/Icon'
// import {state as repState} from 'ducks/replication-mobx';
// function replicationStatus({ paused, waiting, className }) {
//   const sPush = { color: paused.push ? 'grey' : 'green' }
//   const sPull = { color: paused.pull ? 'grey' : 'green' }
//   logit('display', sPush, sPull)
//   const icon = paused.push ? (paused.pull ? 'cloud' : 'cloud-down') : 'cloud-up'
//   return ( <div className={className}>
//     <span>
//       <Icon name={icon}/>
//     </span>
//     {paused.pull ? <span style={{color: '#cccccc'}}>&darr;</span> : <span style={{color: '#00ff00', fontWeight:'bold'}}> &dArr; </span>}
//     {paused.push ? <span style={{color: '#cccccc'}}>&uarr;</span> : <span style={{color: '#00ff00', fontWeight:'bold'}}> &uArr; </span>}
//     {waiting === 0 ? <span style={{color: '#00ff00', fontWeight:'bold'}}>&#10004;</span> : <span style={{color: '#ff0000'}}>{waiting}</span>}
//   </div>
//   )
// }
//
// const mapStateToProps = (state) => {
//   // return state.replicator
//   return repState
// }
//
// export const ReplicationStatus = connect(
//   mapStateToProps,
//   // mapDispatchToProps
// )(replicationStatus)
