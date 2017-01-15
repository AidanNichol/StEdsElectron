import db from '../services/bookingsDB.js';
import { call, put } from 'redux-saga/effects.js';
import {dbChange} from '../ducks/replication-duck'

var styles = {
  walk: 'color:white; background:black;',
  account: 'color:white; background:blue;',
  member: 'color:white; background:green;',
  default: 'color:black; background:cyan;',
};

var style = styles['default'];
const logit = function logit(...Y) {
  console.log('%c%s: %c %s ', style, 'docUpdateSaga', style+'font-weight:bold', ...Y);
};

export default function* docUpdateSaga(doc, action){
  // changes = {walk: {}, book: true, members: [], account: 0}
  try{
    let type = doc.type;
    style = styles[type]? styles[type] : styles['default'];
    logit(type, doc);
    var res = yield call([db, db.put], doc);
    logit('res', res)
    let newDoc = {...doc, _rev: res.rev};
    yield put({type: `change_${newDoc.type}_doc`, doc: newDoc});
    const info = yield call([db, db.info]);
    logit('info', info);
    yield put(dbChange(info.update_seq))



  } catch(error){
     var retry = ((action && action.retry) || 0)+1;
     logit('error', error);
     if (action && error.status === 409 && retry < 4)yield put({...action, retry})
     else yield put({type: `DOC_UPDATE_ERROR`, action, error})
  }
  console.log('res', res);

}
