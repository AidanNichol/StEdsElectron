import React from 'react'
import {observable, action, autorun} from 'mobx';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import {lockSettings} from './settings-duck'
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Lock:mobx');
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const delay = async (fn, ms) => new Promise(resolve => {
  let timerId
  if (timerId)clearTimeout(timerId);
  timerId = setTimeout(fn, ms);
  timerId = undefined;
  resolve();
})
// var timerId;

class lockStore {
  @observable isLocked =  true;
  @observable animate = false;

  @action animateClear = () =>{ this.animate = false; };
  @action animateLock= async () =>{
    logit('animateLock', '')
    this.animate = true;
    await delay(this.animateClear, 4000 );
  };

  @action lock = async () => {this.isLocked = true;};
  @action unlock = async () => {
    this.isLocked = false;
    await delay(this.lock, lockSettings.delay);
  };
  // @action relock = async () => {
  //   this.isLocked = true;
  // }; // lock after time delay
}
const LS = new lockStore();
autorun(()=>logit('lock clicked', {isLocked: LS.isLocked, animate: LS.animate}));


//---------------------------------------------------------------------
//          Helpers
//---------------------------------------------------------------------

export const callIfUnlocked = async (fn)=>{
  logit('callIfUnlocked', LS, fn)
  if (lockSettings.enabled && LS.isLocked) LS.animateLock();
  else fn();
  if (!LS.isLocked && lockSettings.enabled) LS.unlock(); // restart the relocking timer
}



//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------

const LockUnstyled = observer(({className, ...rest})=>{
  logit('lockIcon', {LS, rest})
  const cls = (LS.animate ? 'animate ' : '')+'lock '+className
  return ( lockSettings.enabled &&
    <div className={cls} onClick={()=>LS.isLocked ? LS.unlock() : LS.lock()} {...rest}>
      <span>Click Me First</span>
      <img src={`../assets/icon-${LS.isLocked? '':'un'}locked.svg`} />
    </div>);
});
export const Lock = styled(LockUnstyled)`
@keyframes bounceIn {
  0%,
  100% {
    transform: scale(0.1);
    opacity: 0;
  }

  25%,
  75% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(2);
    opacity: 1;
  }
}

@keyframes shout {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(2);
  }

  100% {
    transform: scale(1);
  }
}


  display: grid;
  grid-template-columns: 32px;
  grid-template-rows: 32px;
  grid-template-areas: "one";
  align-items: center;
  justify-content: center;
  width: 64px;
  cursor: pointer;

  img {
    grid-area: one;
    align-self: center;
    width: 32px;
  }

  span {
    align-self: center;
    grid-area: one;
    display: none;
    position: relative;
    left: -6px;
    font-size: 1em;
    z-index: 10;
    width: 32px;
    text-align: center;
    opacity: 0;
  }

  &.animate {
    & img {
      animation: shout 2s 2;
    }

    & span {
      display: block;
      color: blue;
      opacity: 0;
      animation: bounceIn 4s 1;
    }
  }


`
