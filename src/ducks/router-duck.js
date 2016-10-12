import * as i from 'icepick';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Router');


//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
export const SET_PAGE = 'SET_PAGE';
export const SET_USER = 'SET_USER';

//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const setPage = (page) => ({type: SET_PAGE, page});
export const setUser = (user) => ({type: SET_USER, user});


//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------

const defaultState = i.freeze({page: null, memberId: null, accountId: null});
// export function reducer(state = {page: null, memberId: null, accountId: null}, action) {
export function reducer(state = defaultState, action) {
  switch(action.type) {
    case SET_PAGE :
      return i.set(state, 'page', action.page);
    case SET_USER:
      return i.set(state, 'memberId', action.user);
  }
  return state;
}
