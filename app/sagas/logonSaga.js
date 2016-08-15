// import db from 'services/bookingsDB';

import { take, call, put } from 'redux-saga/effects'

const testUsers = {
  Daniel: {name: 'Daniel', role: '', email: 'dannyfoster27@icloud.com', thumbnail: '', password: ''},
  Harry: {name: 'Harry', role: '', email: 'harry@hogwarts.ac.uk', thumbnail: '', password: ''},
  Tim: {name: 'Tim', role: '', email: 'tim@nicholware.co.uk', thumbnail: '', password: ''},
  Sandy: {name: 'Sandy', role: 'bookings', email: 'sandysandy48@hotmail.co.uk', thumbnail: '', password: ''},
  Val: {name: 'Val', role: 'members', email: 'jimandval@jvdavis.plus.com', thumbnail: '', password: ''},
  Aidan: {name: 'Aidan', role: 'admin', email: 'aidan@nicholware.co.uk', thumbnail: '', password: ''},
}


function* authorize(user, /*password*/) {
  try {
    if (!testUsers[user]) return;

    const session = {...testUsers[user], provider: 'shortcut'};
    yield put({type: 'LOGON_SUCCESS', session})
    return session
  } catch(error) {
    yield put({type: 'ERROR', error: {source: 'logonSaga', ...error}});
  }
}

export default function* loginFlow() {
  while(true){ // eslint-disable-line no-constant-condition
    const {user, password} = yield take('LOGON_REQUEST')
    const session = yield call(authorize, user, password)
    if(session) {
      // yield call(Api.storeItem, {token})
      yield take('LOGOUT_REQUEST')
      // yield call(Api.clearItem, 'token')
    }
  }
}
