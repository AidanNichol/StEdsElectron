/* global PouchDB */
import React from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm} from 'redux-form';
import * as i from 'icepick';
import Logit from '../factories/logit.js';
import {remoteCouchUsers} from '../services/remoteCouch'
const logit = Logit('color:white; background:blue;', 'SigninDuck');


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
import {SubmissionError} from 'redux-form';

var _dbuSetupCompleted = require("pouchdb-seamless-auth")(PouchDB)
    .then(()=> PouchDB.setSeamlessAuthRemoteDB('http://nicholware.com:5984/_users'))
    .then((resp)=>{logit('setSeamlessAuthRemoteDB OK', resp); return resp;})
    .catch((error)=>{logit('setSeamlessAuthRemoteDB Error', error)});

var dbu = new PouchDB('_users');

function* authorize(username, password){
    try{
      logit ('_dbuSetupCompleted', _dbuSetupCompleted);
      yield _dbuSetupCompleted;
      logit('about to signin', username);
      // debugger;
      var resp = yield call([PouchDB, PouchDB.seamlessLogIn], username, password);
      logit('signin resp', resp);
      var sess = yield call([PouchDB, PouchDB.seamlessSession]);
      // logit('session', sess)
      var data = yield call([dbu, dbu.get], 'org.couchdb.user:'+sess.userCtx.name);
      logit('data', data);
      var {name, roles, memberId} = data;
      return {name, roles, memberId};
    }
    catch(error){
      // logit('error', error);
      throw new SubmissionError({ _error: 'Signin failed!  ' + error.message})
    }

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
        yield take(SIGNOUT_REQUESTED);
        yield call([PouchDB, PouchDB.seamlessLogOut]);
        yield put(signoutSuccess());
      }
    }
}

//---------------------------------------------------------------------
//          Reducers
//---------------------------------------------------------------------

const defaultState = i.freeze({name: null, roles: [], memberId: ''});
export function reducer(state = {name: null, roles: [], memberId: ''}, action) {
  switch(action.type) {
    case SIGNIN_SUCCESS :
      return i.assign(state, action.data);
    case SIGNOUT_SUCCESS:
      return i.assign(state, defaultState);
  }
  return state;
}

// import * as i from 'icepick';
// import { createReducer } from 'redux-act';
// import * as actions from '../actions/signin-actions.js';
// const defaultState = i.freeze({name: '', email: '', role: '', thumbnail: '', memberId: '', provider: ''});
// export default createReducer({
//   [actions.signinRequested ]: (state, action)=> i.assign(state, action),
// 	[actions.signinSuccess ]: (state, action)=> i.assign(state, action),
// 	[actions.authenticateUserViaServiceRequested ]: (state, action)=> i.assign(state, action),
// 	[actions.signoutRequested ]: (state)=> i.assign(state, defaultState),
// },
// defaultState); // <-- This is the default state


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

const renderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <span>
      <input {...input} placeholder={label} name={label} type={type}/>
      {touched && error && <span style={errorStyle} > ! {error}</span>}
    </span>
  </div>
);

const SigninForm = (props) => {
  const { error, handleSubmit, submitting, reset, signinRequested, signoutRequested} = props
  return (
    <form onSubmit={handleSubmit(signinRequested)} className="signin">
      {props.name?( <div className="right">
        Logged in: {props.name} ({(props.roles||[]).join(', ')})
        <button onClick={()=>{reset(); signoutRequested()}}>Sign Out</button>
      </div>) : (<div><table><tbody><tr>
        <td><Field name="username" type="text" component={renderField} label="Username" /></td>
        <td><Field name="password" type="password" component={renderField} label="Password" /></td>
        <td><button type="submit" disabled={submitting}>Sign In</button></td>
        </tr></tbody></table>
        {/* <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button> */}
        {error && <span style={errorStyle} >!! {error}</span>}
        {/* </div> */}

      </div>)
      }
    </form>
  )
};


const mapStateToProps = (state)=>state.signin||{};
function mapDispatchToProps(dispatch) {
  return {
    // signinRequested: submit,
    signinRequested: (values)=>dispatch(signinRequested(values.username, values.password)),
    signoutRequested: ()=>dispatch(signoutRequested()),
  }
}
export const Signin = connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'Signin',  // a unique identifier for this form
	// asyncBlurFields: [ 'username' ],
	validate
})(SigninForm))
