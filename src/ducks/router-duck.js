import * as i from 'icepick';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Router');


//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
export const SET_PAGE = 'SET_PAGE';
export const SET_USER = 'SET_USER';
export const ROUTER_INITIALIZED = 'ROUTER_INITIALIZED';

//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const setPage = (payload) => ({type: SET_PAGE, ...payload});
export const setUser = (user, account) => ({type: SET_USER, user, account});
export const routerInitialized = () => ({type: SET_USER});


//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------
export var defaultState = (localStorage.getItem('stEdsRouter') ? JSON.parse(localStorage.getItem('stEdsRouter'))
        : {page: null, memberId: null, accountId: null, initialized: false, walkId: null});

const setAndSaveState = (state, payload)=>{
  let newState = i.assign(state, payload);
  localStorage.setItem('stEdsRouter', JSON.stringify(newState));
  logit('toLocalStorage', newState)
  return newState;
}
// export function reducer(state = {page: null, memberId: null, accountId: null}, action) {
export function reducer(state = defaultState, action) {
  let {type, ...payload}  = action;
  switch(type) {
    case SET_PAGE:
      return setAndSaveState(state, payload);
    case SET_USER:
      return setAndSaveState(state, {memberId: action.user, accountId: action.account});
    case ROUTER_INITIALIZED:
      return i.set(state, 'initialized', true);
  }
  return state;
}
