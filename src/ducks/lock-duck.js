import * as i from 'icepick';
import React from 'react'
import {connect} from 'react-redux';
import { call, put, take, fork, cancel } from 'redux-saga/effects.js';
// import { takeLatest } from 'redux-saga';
import {lockSettings} from './settings-duck'
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Lock:Duck');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
logit('settings', lockSettings)
var isLocked = true;
//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
export const ANIMATE_LOCK = 'ANIMATE_LOCK';
export const ANIMATE_CLEAR = 'ANIMATE_CLEAR';
export const LOCK = 'LOCK';
export const UNLOCK = 'UNLOCK';
export const RELOCK = 'RELOCK';

//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const animateLock= (animate) =>({type: ANIMATE_LOCK, animate});
export const animateClear= (animate) =>({type: ANIMATE_CLEAR});

export const lock = () => ({type: LOCK});
export const unlock = () => ({type: UNLOCK});
export const relock = () => ({type: RELOCK}); // lock after time delay


//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------
export var lockDefaultState = {locked: true, animate:false};

// export function reducer(state = {page: null, memberId: null, accountId: null}, action) {
export function reducer(state = lockDefaultState, action) {
  switch(action.type) {
    case LOCK:
      isLocked = true;
      return i.assign(state, {locked: true, animate: false});
    case UNLOCK:
      isLocked = false;
      return i.assign(state, {locked: false, animate: false});
    case ANIMATE_LOCK:
      return i.set(state, 'animate', action.animate);
    case ANIMATE_CLEAR:
      return i.set(state, 'animate', false);
  }
  return state;
}

//---------------------------------------------------------------------
//          Helpers
//---------------------------------------------------------------------

export const dispatchIfUnlocked = (dispatch, action)=>{
  if (lockSettings.enabled && isLocked) dispatch(animateLock(true));
  else dispatch(action)
  if (!isLocked && lockSettings.enabled) dispatch(unlock())
}

//---------------------------------------------------------------------
//          Saga
//---------------------------------------------------------------------

export function * resetLock (animate) {
  // if (animate)return;
  yield call(delay, animate ? 4000 : lockSettings.delay)
  if (animate) yield put(animateClear())
  else yield put(lock())
}

export function * lockSaga () {
  let task;
  while (true) { // eslint-disable-line no-constant-condition
    // yield takeLatest([UNLOCK, RELOCK], resetLock); // cancels any blocked requests and restarts
    let action = yield take([UNLOCK, RELOCK, ANIMATE_LOCK])
    let animate = (action.type === ANIMATE_LOCK)
    logit('action', {action, animate})
    if (task) {
      yield cancel(task);
    }
    task = yield fork(resetLock, animate);
  }
}

//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------

const LockIcon = ({locked, lockClicked, animate, className, ...rest})=>{
  logit('lockIcon', {locked, animate, rest})
  return ( lockSettings.enabled &&
    <div className={className+' lock'}>
      <span>Click Me First</span>
      <img src={`../assets/icon-${locked? '':'un'}locked.svg`}
       onClick={()=>lockClicked(locked)} {...rest} />
     </div>);
}
const mapStateToProps = (state, {className='', ...rest})=>({
  className: (state.lock.animate ? 'animate ' : '')+'lock '+className,
  locked: state.lock.locked||isLocked,
  animate: state.lock.animate,
  ...rest,
})
function mapDispatchToProps(dispatch) {
  return {
    lockClicked: (locked)=> dispatch(locked ? unlock() : lock()),
  }
}
export const Lock = connect(mapStateToProps, mapDispatchToProps)(LockIcon)
