//---------------------------------------------------------------------
//          Utility Functions
//---------------------------------------------------------------------
import store from '../store';
import {intersection} from 'lodash';

export function isUserAuthorized( okRoles=[]) {
  var usersRoles = (store.getState().signin || {}).roles || [];
	return intersection(usersRoles, ['_admin', 'admin', ...okRoles]).length > 0;
}
