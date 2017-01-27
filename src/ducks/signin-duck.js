/* global PouchDB */
import React from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {DbSettings, getSettings, setSettings} from 'ducks/settings-duck';
import * as i from 'icepick';
import Logit from '../factories/logit.js';
// import {remoteCouchUsers} from '../services/remoteCouch'
const logit = Logit('color:white; background:blue;', 'Signin:Duck');


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
var data;
data='some data to hash2'; logit('hash test', data, getHash(data));
data='54ndR@'; logit('hash test', data, getHash(data));
data='aidan'; logit('hash test', data, getHash(data));
data='54ndR@'; logit('hash test', data, getHash(data));

//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
export const SIGNIN_REQUESTED = 'SIGNIN_REQUESTED';
export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS';
export const SIGNOUT_REQUESTED = 'SIGNOUT_REQUESTED';
export const SIGNOUT_SUCCESS = 'SIGNOUT_SUCCESS';



//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const signinRequested = (username, password) => ({type: SIGNIN_REQUESTED, username, password});
export const signinSuccess = (data) => ({type: SIGNIN_SUCCESS, data});
export const signoutRequested = () => ({type: SIGNOUT_REQUESTED});
export const signoutSuccess = () => ({type: SIGNOUT_SUCCESS});

//---------------------------------------------------------------------
//          Saga
//---------------------------------------------------------------------
// import PouchDB from 'pouchdb';
import { call, put, take } from 'redux-saga/effects.js';
var authError = "";
const remoteDb = `http://${DbSettings.remotehost}:5984/_users`;
const localDb = DbSettings.localUsers;
const adapter = DbSettings.adapter = 'websql';
logit('user DBs', {remoteDb, localDb, reset: DbSettings.resetLocal})
var _dbuSetupCompleted = require("utilities/pouchdb-seamless-auth")(PouchDB, localDb, adapter)
    .then(()=> PouchDB.setSeamlessAuthRemoteDB(remoteDb))
    .then((resp)=>{logit('setSeamlessAuthRemoteDB OK', resp); return resp;})
    .catch((error)=>{logit('setSeamlessAuthRemoteDB Error', error)});

var dbu = new PouchDB(localDb, {adapter});
if (DbSettings.resetLocalUser){
  dbu.destroy()
    .then(()=>{
      setSettings(`database.${getSettings('database.current')}.resetLocalUser`, false)
      dbu = new PouchDB(localDb, {adapter});
    })
}

// function authorization({username, password}){
//   return  _dbuSetupCompleted
//       .then((resp)=>{logit('about to signin', username); return resp})
//       .then(()=>{PouchDB.seamlessLogIn( username, password);})
//       .then((resp)=>{logit('signin resp', resp); return resp})
//       .then(()=>{PouchDB.seamlessSession();})
//       // .then((resp)=>{logit('session', sess) return resp})
//       .then((sess)=>{dbu.get('org.couchdb.user:'+sess.userCtx.name);})
//       .then((data)=>{logit('data', data); return data})
//       .then(({name, roles, memberId})=>({name, roles, memberId}))
//       .catch((error)=>{
//         logit('error', error);
//         throw new Error('redux-form: Signin failed: ' + error.message);
//         // throw new SubmissionError({ _error: 'Signin failed!  ' + error.message})
//       })
//
// }

function* authorize(username, password){
  try{
    authError = '';
    logit ('_dbuSetupCompleted', _dbuSetupCompleted);
    yield _dbuSetupCompleted;
    logit('about to signin', username);
    // debugger;
    var resp = yield call([PouchDB, PouchDB.seamlessLogIn], username, password);
    logit('signin resp', resp);

    var sess = yield call([PouchDB, PouchDB.seamlessSession]);
    localStorage.setItem('stEdsSignin', JSON.stringify({username, password}));
    logit('session', sess)
    var data = yield call([dbu, dbu.get], 'org.couchdb.user:'+sess.userCtx.name);
    logit('data', data);
    var {name, roles, memberId} = data;
    return {name, roles, memberId, machine};
  }
  catch(error){
    logit('error', error);
    authError = `(${error.name}) ${error.message}`
    localStorage.removeItem('stEdsSignin');
    localStorage.removeItem('stEdsRouter');
    // throw new Error('redux-form: Signin failed: ' + error.message);
    return authError
    // throw new SubmissionError({ _error: 'Signin failed!  ' + error.message})
  }
}

export function *resignin(){
  if (!localStorage.getItem('stEdsSignin')) return;
  const {username, password} = JSON.parse(localStorage.getItem('stEdsSignin'));
  if (!username || !password) return;
  logit('resignin', signinRequested(username, password))
  yield put(signinRequested(username, password))
}

export const signinSaga = function* signinSaga(){
// export const signinSaga = function* (){
  logit('loaded', 'args');
  // try{
    while(true){ // eslint-disable-line no-constant-condition
      logit('waiting for','SIGNIN_REQUESTED' );
      let {username, password} = yield take(SIGNIN_REQUESTED);
      var token = yield call(authorize, username,password);
      logit('token', token)
      if (token){
        yield put(signinSuccess(token));
        // sagaMiddleware.run(monitorReplications, remoteCouch);
        yield take(SIGNOUT_REQUESTED);
        yield call([PouchDB, PouchDB.seamlessLogOut]);
        yield put(signoutSuccess());
      }
    }
}

//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------

const defaultState = i.freeze({name: null, roles: [], memberId: '', machine: ''});
export function reducer(state = {name: null, roles: [], memberId: '', machine: ''}, action) {
  switch(action.type) {
    case SIGNIN_SUCCESS :
      return i.assign(state, action.data);
    case SIGNOUT_SUCCESS:
      authError = '';
      localStorage.removeItem('stEdsSignin');
      localStorage.removeItem('stEdsRouter');
      return i.assign(state, defaultState);
  }
  return state;
}

//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------

const validate = values => {
  var errors = {};
  if (!values.username) { errors.username = 'Required'; }
  if (!values.password) { errors.password = 'Required'; }
  return errors;
}

// export default submit
const errorStyle = {fontWeight: 700, color: '#700'};

const renderField = ({ input, label, type, meta: { touched, error }, ...rest }) => (
  <div>
    <span>
      <input {...input} placeholder={label} name={label} type={type} {...rest}/>
      {touched && error && <span style={errorStyle} > ! {error}</span>}
    </span>
  </div>
);

const SigninForm = (props) => {
  const { authError, handleSubmit, submitting, reset, signinRequested, signoutRequested} = props
  return (
    <form onSubmit={handleSubmit(signinRequested)} className="signin">
      {props.name?( <div className="right">
        Logged in: {props.name} ({(props.roles||[]).join(', ')})
        <button onClick={()=>{reset(); signoutRequested()}}>Sign Out</button>
      </div>) : (<div><table><tbody><tr>
        <td><Field name="username" type="text" component={renderField} label="Username" onFocus={()=>{reset(); signoutRequested()}}/></td>
        <td><Field name="password" type="password" component={renderField} label="Password" /></td>
        <td><button type="submit" disabled={submitting}>Sign In</button></td>
        </tr></tbody></table>
        {/* <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button> */}
        <span style={errorStyle} >{authError}&nbsp;</span>
        {/* </div> */}

      </div>)
      }
    </form>
  )
};


const mapStateToProps = (state)=>{
  return {...(state.signin||{}), authError};
}
function mapDispatchToProps(dispatch) {
  return {
    // signinRequested: submit,
    signinRequested: (values)=>{
      try {
        dispatch(signinRequested(values.username, values.password))
      }
      catch(error){
        logit('error2', error);
        throw new SubmissionError({ _error: 'Signin failed!  ' + error.message})
      }},
    signoutRequested: ()=>dispatch(signoutRequested()),
  }
}
export const Signin = connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'Signin',  // a unique identifier for this form
	// asyncBlurFields: [ 'username' ],
	validate
})(SigninForm))
