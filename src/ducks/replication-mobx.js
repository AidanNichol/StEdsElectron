/* global PouchDB */
const React = require('react');
const db = require('../services/bookingsDB');
const styled = require('styled-components').default;
// import styled from 'styled-components';
const { observable, action, computed, autorun, toJS, decorate } = require('mobx');
const { observer } = require('mobx-react');
const { DbSettings } = require('ducks/settings-duck');
const { Icon } = require('components/utility/Icon');
const emitter = require('../mobx/eventBus');

const Logit = require('../factories/logit');
var logit = Logit(__filename);
logit('styled-components', styled);
class ReplState {
  constructor() {
    this.lastAction;
    this.current = 'paused';
    this.dblocal_seq;
    this.push = { written: 0, last_seq: localStorage.getItem('stEdsReplSeq') };
    this.pull = { written: 0, last_seq: null };
  }
  get waiting() {
    return this.dblocal_seq - this.push.last_seq;
  }
  async dbChange() {
    await updateStateFromLocalDB('db changed');
  }
}
decorate(ReplState, {
  lastAction: observable,
  current: observable,
  dblocal_seq: observable,
  push: observable,
  pull: observable,
  waiting: computed,
  dbChange: action,
});
let state = new ReplState();
exports.state = state;
// export const state = observable.object(
//   {
//     lastAction: undefined,
//     current: 'paused',
//     waiting: () => state.dblocal_seq - state.push.last_seq,
//     dblocal_seq: undefined,
//     push: { written: 0, last_seq: localStorage.getItem('stEdsReplSeq') },
//     pull: { written: 0, last_seq: null },
//     dbChange: async () => {
//       await updateStateFromLocalDB('db changed');
//     },
//   },
//   { waiting: computed, dbChange: action },
// );
autorun(() => logit('state changed', { ...toJS(state) }));
emitter.on('dbChanged', data => updateStateFromLocalDB(data));
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

async function monitorReplications() {
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
exports.monitorReplications = monitorReplications;

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

const ReplicationStatus = styled(replicationStatus)`
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
exports.ReplicationStatus = ReplicationStatus;
