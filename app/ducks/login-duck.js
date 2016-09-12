/* global PouchDB */
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:blue;', 'LoginDuck');

//---------------------------------------------------------------------
//          Constants
//---------------------------------------------------------------------
const LOGON_REQUESTED = 'LOGON_REQUESTED'
const LOGON_SUCCESS = 'LOGON_SUCCESS'
const LOGOUT_REQUESTED = 'LOGOUT_REQUESTED'
const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'



//---------------------------------------------------------------------
//          Action Creators
//---------------------------------------------------------------------

export const logonRequested = (username, password) => ({type: LOGON_REQUESTED, username, password})
export const logonSuccess = (data) => ({type: LOGON_SUCCESS, data})
export const logoutRequested = () => ({type: LOGOUT_REQUESTED})
export const logoutSuccess = () => ({type: LOGOUT_SUCCESS})

//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------

import * as i from 'icepick';
const defaultState = i.freeze({name: null, roles: [], memberId: ''});
export default function(state = defaultState, action) {
  switch(action.type) {
    case LOGON_SUCCESS :
      return i.assign(state, action.data);
    case LOGOUT_SUCCESS:
      return i.assign(state, defaultState);
  }
  return state;
}



//---------------------------------------------------------------------
//          Saga
//---------------------------------------------------------------------
import { call, put, take } from 'redux-saga/effects';

var _dbuSetupCompleted = require("pouchdb-seamless-auth")(window.PouchDB)
    .then(()=> PouchDB.setSeamlessAuthRemoteDB('http://nicholware.com:5984/_users'));

var dbu = new PouchDB('_users')

function* authorize(username, password){
    try{
      yield _dbuSetupCompleted;
      var resp = yield call([PouchDB, PouchDB.seamlessLogIn], username, password);
      logit('login resp', resp);
      var sess = yield call([PouchDB, PouchDB.seamlessSession]);
      logit('session', sess)
      var data = yield call([dbu, dbu.get], 'org.couchdb.user:'+sess.userCtx.name);
      logit('data', data);
      var {name, roles, memberId} = data;
      return {name, roles, memberId};
    }
    catch(error){
      logit('error', error);
      throw new SubmissionError({ _error: 'Login failed!  ' + error.message})
    }

}

export function* loginSaga(args){
  logit('loaded', args);
  // try{
    while(true){ // eslint-disable-line no-constant-condition
      logit('waiting for','LOGON_REQUESTED' );
      let {username, password} = yield take(LOGON_REQUESTED);
      var token = yield call(authorize, username,password);
      logit('token', token)
      if (token){
        yield put(logonSuccess(token));
        yield take(LOGOUT_REQUESTED);
        yield call([PouchDB, PouchDB.seamlessLogOut]);
        yield put(logoutSuccess());
      }
    }
}

//---------------------------------------------------------------------
//          Utility Functions
//---------------------------------------------------------------------
import store from '../store';
import {intersection} from 'lodash';

export function isUserAuthorized( okRoles=[]) {
  console.trace();
  logit('isUserAuthorized', okRoles);
  var usersRoles = (store.getState().logon || {}).roles || [];
	// if (!usersRoles)return false;
	if (!Array.isArray(usersRoles))usersRoles = [usersRoles];
	var authorizedRoles = ['_admin', 'admin', ...okRoles];

	console.log('isAuthorized', authorizedRoles, usersRoles, okRoles );
  return intersection(usersRoles, ['_admin', 'admin', ...okRoles]).length > 0;
	// return [...usersRoles].some((role)=>authorizedRoles.indexOf(role)!==-1);
}

//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------
import React from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm,  SubmissionError} from 'redux-form';

const validate = values => {
  const errors = {}
  if (!values.username) { errors.username = 'Required' }
  if (!values.password) { errors.password = 'Required' }
  return errors
}

// export default submit
const errorStyle = {fontWeight: 700, color: '#700'}

const renderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <span>
      <input {...input} placeholder={label} name={label} type={type}/>
      {touched && error && <span style={errorStyle} > ! {error}</span>}
    </span>
  </div>
)

const LoginForm = (props) => {
  const { error, handleSubmit, submitting, reset, logonRequested, logoutRequested} = props
  return (
    <form onSubmit={handleSubmit(logonRequested)} className="logon">
      {props.name?( <div className="right">
        Logged in: {props.name} ({(props.roles||[]).join(', ')})
        <button onClick={()=>{reset(); logoutRequested()}}>Logout</button>
      </div>) : (<div>
        <Field name="username" type="text" component={renderField} label="Username"/>
        <Field name="password" type="password" component={renderField} label="Password"/>
        <div>
        <button type="submit" disabled={submitting}>Log In</button>
        {/* <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button> */}
        {error && <span style={errorStyle} >!! {error}</span>}
        </div>

      </div>)
      }
    </form>
  )
}


const mapStateToProps = (state)=>state.logon;
function mapDispatchToProps(dispatch) {
  return {
    // logonRequested: submit,
    logonRequested: (values)=>dispatch(logonRequested(values.username, values.password)),
    logoutRequested: ()=>dispatch(logoutRequested()),
  }
}
export const Login = connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'Login',  // a unique identifier for this form
	// asyncBlurFields: [ 'username' ],
	validate
})(LoginForm))
