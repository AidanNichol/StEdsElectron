// import * as i from 'icepick';
// import Logit from '../factories/logit.js';
// const logit = Logit('color:white; background:blue;', 'UIstate:duck');
//
//
// //---------------------------------------------------------------------
// //          Constants
// //---------------------------------------------------------------------
// export const SET_UI_STATE = 'UIstate:set:';
// export const RESET_UI_STATE = 'UIstate:reset:';
//
// //---------------------------------------------------------------------
// //          Action Creators
// //---------------------------------------------------------------------
//
// export const setUiState = (field, value) => ({type: SET_UI_STATE+field, value});
// export const resetUiState = () => ({type: RESET_UI_STATE});
//
// //---------------------------------------------------------------------
// //          Helper
// //---------------------------------------------------------------------
//
// export const getUiState = (state, field) => {
//   logit('getUiState', state, state.uiState, field)
//   return state && state.uiState && state.uiState[field];
// }
//
// //---------------------------------------------------------------------
// //          Reducers
// //---------------------------------------------------------------------
//
// export function reducer(state = {}, action) {
//   let {type, value}  = action;
//   if (type === RESET_UI_STATE) return {};
//   if (!type.startsWith(SET_UI_STATE))return state;
//   const field = type.substr(SET_UI_STATE.length);
//   return i.set(state, field, value);
// }
