/* global PouchDB */
import {intersection, merge, pick} from 'lodash';
import React from 'react';
import {remoteCouch} from 'services/bookingsDB';
import {getSettings, setSettings} from 'ducks/settings-duck';
import {observable, action, computed, runInAction, reaction, toJS} from 'mobx';
import {observer} from 'mobx-react';
import Logit from '../factories/logit.js';
const logit = Logit('color:white; background:blue;', 'Signin:mobx');

//---------------------------------------------------------------------
//          Mobx State
//---------------------------------------------------------------------
var lastAction='';
var remoteDB = new PouchDB(remoteCouch, {skip_setup: true});
export class SigninState {
  @observable name = '';
  @observable password = '';
  @observable authError = '';
  @observable loggedIn = false;
  @observable roles = [];
  @computed get isBookingsAdmin(){return intersection(this.roles, ['_admin', 'admin', 'bookings']).length > 0;}
  @computed get isMemberAdmin(){return intersection(this.roles, ['_admin', 'admin', 'membership', 'bookings']).length > 0;}

}
export const state = new SigninState();

reaction(()=>({loggedIn:state.loggedIn, authError: state.authError}), ()=>{
  const {loggedIn, name, roles, authError} = state;
  logit('state after '+lastAction, {loggedIn, name, roles: toJS(roles), authError})
}, {delay:0})

export const login = action(async (name, password)=>{
  try {
    // if (!localStorage.getItem('stEdsSignin')) return;
    // const {username, password} = JSON.parse(localStorage.getItem('stEdsSignin'));
    logit('args                                                             ', name, password, remoteCouch)
    var resp = await remoteDB.login(name, password, {
      ajax: {
        body: { name: name, password: password }
      }
    });
    logit('login resp:', resp);
      runInAction('update state after signin', () => {
      localStorage.setItem('stEdsSignin', JSON.stringify({username: name, name, password}));
      // const {username, password} = JSON.parse(localStorage.getItem('stEdsSignin'));
      merge(state, pick(resp, ['name', 'roles']), {loggedIn:true, authError: ''});
      lastAction = 'Login';
      setSettings('user.'+name, {roles: state.roles, password: getHash(state.password)})
    })
    return false;
  }
  catch(error){
    logit('signin error: ', error)
    const authError = `(${error.name}) ${error.message}`
    localStorage.removeItem('stEdsSignin');
    localStorage.removeItem('stEdsRouter');
    runInAction('set error', ()=>{state.authError = authError});
  }

})
const logout = action(async ()=>{
  await remoteDB.logout();
  localStorage.removeItem('stEdsSignin');
  localStorage.removeItem('stEdsRouter');
  runInAction('update state after logout', ()=>{
    lastAction = 'Logout';
    merge(state, {loggedIn: false, name: '', password: '', roles: '', authError: ''})
  })
})

export function reLogin(){
  const userData = getSettings('user')
  const curUser = userData.current;
  // logit('reLogin curUser', curUser, userData);
  if (!localStorage.getItem('stEdsSignin')) return;
  const {username, password} = JSON.parse(localStorage.getItem('stEdsSignin'));
  // logit('reLogin who', username, password);
  if (!username || !password) return;
  const {password: uPassword, roles} = userData[curUser];
  // logit('reLogin cdata', {myData, uPassword, roles}, getHash(password), state);
  if (username != curUser || getHash(password) !== uPassword) return;
  // logit('reLogin merging', state, {name: username, roles});
  lastAction = 'reLogin';
  merge(state, {name: username, roles, loggedIn: true})
}

const focusedName = action(()=>{
  runInAction('name got focus', ()=>{
    state.name = '';
    state.password = '';
  } )
})

//---------------------------------------------------------------------
//          Identify the machine this is running on
//---------------------------------------------------------------------

import {getMac}from 'getmac';
let machine;
getMac((err, macAddr)=>{
  if (err)  throw err
  machine = macAddr;
  logit('machine', machine)
})
const getHash = data=>{
  const crypto = require('crypto');
  const hash1 = crypto.createHash('sha256');

  hash1.update(data);
  return hash1.digest('hex');

}

//---------------------------------------------------------------------
//          Helper Functions
//---------------------------------------------------------------------




//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------
const handleInputChange = action((event)=> {
  const target = event.target;
  state[target.name] = target.value;
  });
const detectEnter = action((event)=> {
  logit('input', event.keyCode, event.which);
  if ((event.keyCode || event.which)=== 13){logMeIn(); return false;}
  });

const logMeIn = () => {
  logit('logmeIn', state.name, state.password)
  if (state.name === '' ) { state.authError = 'Name Required'; return;}
  if (state.password === '' ) { state.authError = 'Password Required'; return;}
  login(state.name, state.password)
  return ;
}

// export default submit
const errorStyle = {fontWeight: 700, color: '#700'};

export const SigninForm = observer(() => {
  const loggedIn = (
    <div className="right">
      Logged in: {state.name} ({(state.roles||[]).join(', ')})
      <button onClick={logout}>Sign Out</button>
    </div>
  )

  const notLoggedIn = (
    <div><table><tbody><tr>
      <td>
        <input placeholder='username' name='name' type="text" value={state.name} onKeyDown={detectEnter} onChange={handleInputChange}
          onFocus={focusedName}/>
      </td>
      <td>
        <input placeholder='password' name='password' type="password" value={state.password} onKeyDown={detectEnter} onChange={handleInputChange} />
      </td>
      <td><button onClick={()=>logMeIn()}>Sign In</button></td>
    </tr></tbody></table>
      <span style={errorStyle} >{state.authError}&nbsp;</span>
    </div>
  )

  return (
    <div className="signin">
      {state.loggedIn ? loggedIn: notLoggedIn}
    </div>
  )
});


// const mapStateToProps = (state)=>{
//   return {...(state.signin||{}), authError};
// }
// function mapDispatchToProps(dispatch) {
//   return {
//     // signinRequested: submit,
//     signinRequested: (values)=>{
//       try {
//         dispatch(signinRequested(values.username, values.password))
//       }
//       catch(error){
//         logit('error2', error);
//         throw new SubmissionError({ _error: 'Signin failed!  ' + error.message})
//       }},
//     signoutRequested: ()=>dispatch(signoutRequested()),
//   }
// }
// export const Signin = connect(mapStateToProps, mapDispatchToProps)(reduxForm({
//   form: 'Signin',  // a unique identifier for this form
// 	// asyncBlurFields: [ 'username' ],
// 	validate
// })(SigninForm))
