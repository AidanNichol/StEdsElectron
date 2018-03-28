/* global PouchDB */
import React from 'react';
import db from '../services/bookingsDB';
import styled from 'styled-components';
import { observable, action, computed, autorun, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { DbSettings } from 'ducks/settings-duck';
import { Icon } from 'components/utility/Icon';

import Logit from '../factories/logit';
var logit = Logit(__filename);

export const state = observable({
  lastAction: undefined,
  current: 'paused',
  waiting: computed(() => state.dblocal_seq - state.push.last_seq),
  dblocal_seq: undefined,
  push: { written: 0, last_seq: localStorage.getItem('stEdsReplSeq') },
  pull: { written: 0, last_seq: null },
  dbChange: action(async () => {
    await updateStateFromLocalDB('db changed');
  }),
});
autorun(() => logit('state changed', { ...toJS(state) }));

export const replicationDbChange = updateStateFromLocalDB;
// Monitor replications is launched by store.js
async function updateStateFromLocalDB(txt, updatePush = false) {
  const info = await db.info();
  logit(`${txt} local info`, info);
  state.dblocal_seq = info.update_seq;
  if (updatePush) {
    state.push.last_seq = info.update_seq;
    localStorage.setItem('stEdsReplSeq', state.push.last_seq);
  }
  state.lastAction = txt;
}
export async function monitorReplications() {
  const remoteCouch = `http://${DbSettings.remotehost}:5984/${DbSettings.remotename}`;
  try {
    PouchDB.plugin(require('pouchdb-authentication'));
    if (!localStorage.getItem('stEdsSignin')) return;
    const { username, password } = JSON.parse(localStorage.getItem('stEdsSignin'));

    var remoteDB = new PouchDB(remoteCouch, { skip_setup: true });
    var resp = await remoteDB.login(username, password, {
      ajax: {
        body: { name: username, password: password },
      },
    });
    logit('login resp:', resp);
    await updateStateFromLocalDB('setup', true);

    db
      .sync(remoteCouch, {
        live: true,
        timeout: 60000,
        retry: true,
      })
      .on('change', info => {
        let direction = info.direction;
        state[direction].last_seq = info.change.last_seq;
        state[direction].written = info.change.docs_written;
        state.lastAction = 'change';
      })
      .on('paused', async () => {
        await updateStateFromLocalDB('replication paused', state.current !== 'paused');
        state.current = 'paused';
      })
      .on('active', info => {
        state.lastAction = 'replication active';
        state.current = info.direction;
      })
      .on('denied', err => logit('on denied', err))
      .on('complete', err => logit('on complete', err))
      .on('error', err => logit('on error', err));
  } catch (err) {
    logit('signin error', err, remoteCouch);
  }
}

const replicationStatus = observer(props => {
  const { className } = props;
  var xtra = {};
  if (state.pull.written || state.dblocal_seq === 0) {
    xtra[`data-pulled`] = state.pull.written;
  }
  if (state.waiting) {
    xtra[`data-waiting`] = state.waiting;
  } else if (state.push.written) {
    xtra[`data-pushed`] = state.push.written;
  }
  logit('repstatus', xtra);
  return (
    <span className={className} {...xtra}>
      <Icon name={`cloud-${state.current}`} />
    </span>
  );
});

export const ReplicationStatus = styled(replicationStatus)`
  position: relative;
  width: 24px;

  &[data-sent]:after,
  &[data-waiting]:after,
  &[data-pushed]:after,
  &[data-pulled]:before {
    position: absolute;
    font-size: 0.7em;
    color: white;
    min-width: 18px;
    height: 18px;
    text-align: center;
    line-height: 18px;
    border-radius: 50%;
    box-shadow: 0 0 1px #333;
  }
  &[data-pushed]:after {
    content: attr(data-pushed);
    top: -8px;
    right: -8px;
    background: green;
  }
  &[data-pulled]:before {
    content: attr(data-pulled);
    background: blue;
    left: -8px;
    bottom: -8px;
  }
  &[data-sent]:after {
    content: attr(data-sent);
    top: -8px;
    right: -8px;
    background: green;
  }

  &[data-waiting]:after {
    content: attr(data-waiting);
    top: -8px;
    right: -8px;
    background: red;
  }
`;
