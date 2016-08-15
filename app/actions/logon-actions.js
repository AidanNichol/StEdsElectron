import { createAction } from 'redux-act';

	export const logonRequested = createAction('LOGON_REQUESTED');
	export const logonSuccess = createAction('LOGON_SUCCESS');
	export const authenticateUserViaServiceRequested = createAction('LOGON_AUTHENTICATE_USER_VIA_SERVICE_REQUESTED');
	export const logoutRequested = createAction('LOGOUT_REQUESTED');
