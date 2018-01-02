/* global PouchDB */
import { intersection, merge, pick } from 'lodash';
import React from 'react';
import { remoteCouch } from 'services/bookingsDB';
import { getSettings, setSettings } from 'ducks/settings-duck';
import {
  observable,
  action,
  computed,
  runInAction,
  reaction,
  toJS,
} from 'mobx';
import { observer } from 'mobx-react';
import { setRouterPage } from 'ducks/router-mobx';
import Logit from '../factories/logit.js';
const logit = Logit(__filename);

//---------------------------------------------------------------------
//          Mobx State
//---------------------------------------------------------------------
var lastAction = '';
var remoteDB = new PouchDB(remoteCouch, { skip_setup: true });
export class SigninState {
  @observable name = '';
  @observable password = '';
  @observable authError = '';
  @observable loggedIn = false;
  @observable roles = [];
  machine = null;
  @computed
  get isBookingsAdmin() {
    return intersection(this.roles, ['_admin', 'admin', 'bookings']).length > 0;
  }
  @computed
  get isMemberAdmin() {
    return (
      intersection(this.roles, ['_admin', 'admin', 'membership', 'bookings'])
        .length > 0
    );
  }
}
export const state = new SigninState();
export const getUpdater = () => state.name;
reaction(
  () => ({ loggedIn: state.loggedIn, authError: state.authError }),
  () => {
    const { loggedIn, name, roles, authError } = state;
    logit('state after ' + lastAction, {
      loggedIn,
      name,
      roles: toJS(roles),
      authError,
    });
  },
  { delay: 0 },
);

export const login = action(async (name, password) => {
  try {
    // try using loacally saved data to perform login
    const err = localLogin(name, password);
    if (!err) {
      localStorage.setItem(
        'stEdsSignin',
        JSON.stringify({ username: name, name, password }),
      );
      restoreRouterData();
      return;
    }
    // OK - try the remote DB
    logit('args', name, password, remoteCouch);
    var resp = await remoteDB.login(name, password, {
      ajax: {
        body: { name: name, password: password },
      },
    });
    logit('login resp:', resp);
    runInAction('update state after signin', () => {
      localStorage.setItem(
        'stEdsSignin',
        JSON.stringify({ username: name, name, password }),
      );
      // const {username, password} = JSON.parse(localStorage.getItem('stEdsSignin'));
      merge(state, pick(resp, ['name', 'roles']), {
        loggedIn: true,
        authError: '',
      });
      lastAction = 'Login';
      setSettings('user.' + name, {
        roles: state.roles,
        password: getHash(state.password),
      });
      setSettings('user.current', name);
      restoreRouterData();
    });
    return false;
  } catch (error) {
    logit('signin error: ', error);
    const authError = `(${error.name}) ${error.message}`;
    localStorage.removeItem('stEdsSignin');
    localStorage.removeItem('stEdsRouter');
    runInAction('set error', () => {
      state.authError = authError;
    });
  }
});
const logout = action(async () => {
  await remoteDB.logout();
  localStorage.removeItem('stEdsSignin');
  localStorage.removeItem('stEdsRouter');
  runInAction('update state after logout', () => {
    lastAction = 'Logout';
    merge(state, {
      loggedIn: false,
      name: '',
      password: '',
      roles: '',
      authError: '',
    });
  });
});

export const reLogin = action('relogin', () => {
  const userData = getSettings('user');
  const curUser = userData.current;
  if (!localStorage.getItem('stEdsSignin')) {
    logit('reLogin no signin data saved', curUser, userData);
    return;
  }
  const { username, password } = JSON.parse(
    localStorage.getItem('stEdsSignin'),
  );
  const err = localLogin(username, password);
  if (err) logit('localLogin failed', err);
  else restoreRouterData();
});

const localLogin = action('localLogin', (username, password) => {
  const userData = getSettings('user');
  // const curUser = userData.current;
  if (!username || !password) return 'data missing';
  const { password: uPassword, roles } = userData[username];
  if (getHash(password) !== uPassword)
    return `password mismatch  username;${username}  ${uPassword +
      ' !== ' +
      getHash(password)}`;
  lastAction = 'reLogin';
  merge(state, { name: username, roles, loggedIn: true });
  logit('relogin successful', username, roles);
  return;
});

function restoreRouterData() {
  const savedValues = localStorage.getItem('stEdsRouter');
  const savedRoutingEnabled = getSettings('router.enabled');
  if (savedRoutingEnabled && savedValues) {
    logit('restoreRouterData', savedValues, savedRoutingEnabled);
    setRouterPage(JSON.parse(savedValues));
  }
}

const focusedName = action(() => {
  runInAction('name got focus', () => {
    state.name = '';
    state.password = '';
  });
});

//---------------------------------------------------------------------
//          Identify the machine this is running on
//---------------------------------------------------------------------

import { getMac } from 'getmac';
// let machine;
getMac((err, macAddr) => {
  if (err) throw err;
  state.machine = macAddr;
  logit('machine', state.machine);
});
const getHash = data => {
  const crypto = require('crypto');
  const hash1 = crypto.createHash('sha256');

  hash1.update(data);
  return hash1.digest('hex');
};

//---------------------------------------------------------------------
//          Helper Functions
//---------------------------------------------------------------------

//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------
const handleInputChange = action(event => {
  const target = event.target;
  state[target.name] = target.value;
});
const detectEnter = action(event => {
  logit('input', event.keyCode, event.which);
  if ((event.keyCode || event.which) === 13) {
    logMeIn();
    return false;
  }
});

const logMeIn = () => {
  logit('logmeIn', state.name, state.password);
  if (state.name === '') {
    state.authError = 'Name Required';
    return;
  }
  if (state.password === '') {
    state.authError = 'Password Required';
    return;
  }
  login(state.name, state.password);
  return;
};

// export default submit
const errorStyle = { fontWeight: 700, color: '#700' };

export const SigninForm = observer(() => {
  const loggedIn = (
    <div className="right">
      Logged in: {state.name} ({(state.roles || []).join(', ')})
      <button onClick={logout}>Sign Out</button>
    </div>
  );

  const notLoggedIn = (
    <div>
      <table>
        <tbody>
          <tr>
            <td>
              <input
                placeholder="username"
                name="name"
                type="text"
                value={state.name}
                onKeyDown={detectEnter}
                onChange={handleInputChange}
                onFocus={focusedName}
              />
            </td>
            <td>
              <input
                placeholder="password"
                name="password"
                type="password"
                value={state.password}
                onKeyDown={detectEnter}
                onChange={handleInputChange}
              />
            </td>
            <td>
              <button onClick={() => logMeIn()}>Sign In</button>
            </td>
          </tr>
        </tbody>
      </table>
      <span style={errorStyle}>{state.authError}&nbsp;</span>
    </div>
  );

  return (
    <div className="signin">{state.loggedIn ? loggedIn : notLoggedIn}</div>
  );
});
