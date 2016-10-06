//---------------------------------------------------------------------
//          Utility Functions
//---------------------------------------------------------------------
import {store} from '../store.js';
import {intersection} from 'lodash';

export function isUserAuthorized( okRoles=[]) {
  var usersRoles = (store.getState().signin || {}).roles || [];
	return intersection(usersRoles, ['_admin', 'admin', ...okRoles]).length > 0;
}
