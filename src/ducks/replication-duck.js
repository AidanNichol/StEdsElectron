import db from '../services/bookingsDB.js';
import { eventChannel, END, buffers } from 'redux-saga'
import { call, put, take } from 'redux-saga/effects.js';

import Logit from '../factories/logit.js';
var logit = Logit('color:white; background:red;', 'replicationDuck');
import * as i from 'icepick'

	const DB_CHANGE = 'repliction/db_change'
	const CHANGE = 'repliction/change'
	const ACTIVE = 'replication/active'
	const PAUSED = 'replication/paused'
  // dbChanges is stated by docUpdateSaga
	export const replicationChange = (payload)=>({type: CHANGE, ...payload})
	export const replicationActive = (payload)=>({type: ACTIVE, ...payload})
	export const replicationPaused = ()=>({type: PAUSED})
	export const dbChange = (db_seq)=>({type: DB_CHANGE, db_seq})

  const defaultState = i.freeze({current: undefined, paused: {push: true, pull: true}, waiting: 0, repl_seq: undefined, db_seq: undefined})
  export default function reducer(state = defaultState, action = {}) {
    switch (action.type) {
			case ACTIVE:
				return i.chain(state)
									.set('current', action.direction)
									.setIn(['paused', action.direction], false)
									.value()
			case PAUSED:
				if (!state.current)return state
				return i.chain(state)
									.setIn(['paused', state.current], true)
									.set('current', undefined)
									.value();
			case CHANGE: {
				if (action.direction === 'pull') return state
				let cur_seq = action.change.last_seq
				return i.chain(state)
				.set('waiting', state.db_seq - cur_seq)
				.set('repl_seq', cur_seq)
				.value();
			}
			case DB_CHANGE:{
				logit('reducer', action)
				let repl_seq = state.repl_seq ? state.repl_seq : action.db_seq
				return i.chain(state)
				.set('db_seq', action.db_seq)
				.set('repl_seq', repl_seq)
				.set('waiting', action.db_seq - repl_seq )
				.value();
			}
      // do reducer stuff
      default: return state
    }
  }
// Monitor replications is launched by store.js

function createReplicationChannel (remoteCouch) {
	logit('remoteCouch', remoteCouch);
  // every change event will call put on the channel
  let subscriber = (emitter)=>{
    let replicator = 	db.sync(remoteCouch, {
				live: true,
				timeout: 60000,
				retry: true
			})
			.on('change', (info)=>emitter(replicationChange(info)))
			.on('paused', (info)=>emitter(replicationPaused(info)))
			.on('active', (info)=>emitter(replicationActive(info)))
			.on('complete', ()=>emitter(END))
			.on('error', (err)=>logit('error', err))


      // The subscriber must return an unsubscribe function
      return () => replicator.cancel();
    };
  return eventChannel(subscriber, buffers.fixed());

}

export function * monitorReplications (remoteCouch) {
  const info = yield call([db, db.info]);
  logit('info', info);
	yield put(dbChange(info.update_seq))
  const channel = yield call(createReplicationChannel, remoteCouch);

  while (true) { // eslint-disable-line no-constant-condition
    const action = yield take(channel); // Blocks until the promise resolves
    logit('action', action);
		yield put(action);

  }
}
