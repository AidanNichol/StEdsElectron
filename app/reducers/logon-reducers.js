import * as i from 'icepick';
import { createReducer } from 'redux-act';
import * as actions from 'actions/logon-actions';
const defaultState = i.freeze({name: '', email: '', role: '', thumbnail: '', memberId: '', provider: ''});
export default createReducer({
  [actions.loginRequested ]: (state, action)=> i.assign(state, action),
	[actions.logonSuccess ]: (state, action)=> i.assign(state, action),
	[actions.authenticateUserViaServiceRequested ]: (state, action)=> i.assign(state, action),
	[actions.logoutRequested ]: (state)=> i.assign(state, defaultState),
},
defaultState); // <-- This is the default state
