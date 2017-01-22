import React from 'react';
import db from '../services/bookingsDB';
import styled from 'styled-components';
import {observable, action, computed, autorun, toJS} from 'mobx';
import {observer} from 'mobx-react';
import {DbSettings} from 'ducks/settings-duck';
import {Icon} from 'components/utility/Icon'

import Logit from '../factories/logit';
var logit = Logit('color:white; background:red;', 'replication:mobx');

export const state = observable({
	current: 'paused',
	waiting: computed(()=>state.db_seq - state.last_seq),
	sent: computed(()=>state.last_seq - state.first_seq),
	last_seq: undefined, // sequence no. at last replication
	db_seq: undefined,
	first_seq: 0, // db sequence no at start up
	dbChange: action(info=> state.db_seq = info.update_seq),
})
autorun(()=>logit('state changed', {...toJS(state)}))

// Monitor replications is launched by store.js

export async function monitorReplications () {
	const remoteCouch = `http://${DbSettings.remotehost}:5984/${DbSettings.remotename}`;
	// yield take('SIGNIN_SUCCESS');
	if (!localStorage.getItem('stEdsSignin')) return;
	// const {username, password} = JSON.parse(localStorage.getItem('stEdsSignin'));

  const info = await db.info();
  logit('info', info);
	state.first_seq = info.update_seq;
	state.last_seq = localStorage.getItem('stEdsReplSeq') || info.update_seq;
	state.first_seq = state.last_seq;
  db.sync(remoteCouch, {
			live: true,
			timeout: 60000,
			retry: true
		})
		.on('change', (info)=>{
			state.last_seq = info.change.last_seq;
			localStorage.setItem('stEdsReplSeq', state.last_seq);
		})
		.on('paused', ()=>state.current = 'paused')
		.on('active', (info)=>state.current = info.direction)
		// .on('complete', ()=>emitter(END))
		.on('error', (err)=>logit('error', err))


}

const replicationStatus = observer((props)=>{
	// let {waiting, sent} = state;
	const {className } = props;
	var xtra = {'data-test': 1};
	const badge = state.waiting || state.sent;
	if (state.waiting){xtra[`data-waiting`] = state.waiting;}
	else if (state.sent){xtra[`data-sent`] = state.sent;}
	logit('repstatus', badge, xtra)
  return (
    <span className={className} {...xtra}>
			<Icon name={`cloud-${state.current}`}/>
    </span>

  )
})
const badge = `
		position:absolute;
		top:-8px;
		right:-8px;
		font-size:.7em;
		color:white;
		width:18px;height:18px;
		text-align:center;
		line-height:18px;
		border-radius:50%;
		box-shadow:0 0 1px #333;`
export const ReplicationStatus = styled(replicationStatus)`

	position:relative;
	width: 24px;



	&[data-sent]:after{
		content:attr(data-sent);
		background: green;
		${badge}
	}

	&[data-waiting]:after {
		content:attr(data-waiting);
		background: red;
		${badge}
	}
`
