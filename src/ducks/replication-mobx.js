/* global PouchDB */
const React = require('react');
let db;
const styled = require('styled-components').default;
const { observable, computed, autorun, toJS, decorate } = require('mobx');
const { observer } = require('mobx-react');
const { DbSettings } = require('settings');
const { Icon } = require('components/utility/Icon');
const emitter = require('../mobx/eventBus');
const path = require('path');
let remoteDB;

const Logit = require('logit');
var logit = Logit(__filename);
logit('styled-components', styled);
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Class to manage to state of the replication services   ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

class ReplState {
  constructor(setdb) {
    db = setdb;
    this.lastAction = 'initial';
    this.current = 'paused';
    this.waiting = parseInt(localStorage.getItem('stEdsWaiting')) || 0;
    this.pushed = 0;
    this.curr_seq;
    this.start_seq;
    this.pullOn = false;
  }

  get pulled() {
    return this.curr_seq - this.start_seq - this.pushed;
  }
}
decorate(ReplState, {
  lastAction: observable,
  current: observable,
  curr_seq: observable,
  waiting: observable,
  pushed: observable,
  pulled: computed,
});
let state = new ReplState();
exports.state = state;

autorun(() => logit('state changed', { ...toJS(state) }), { delay: 3 }); // log whenever the state changes
// remember the number of changes pending replication so the data can persist across a restart
autorun(() => localStorage.setItem('stEdsWaiting', state.waiting), { delay: 300 });

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Listen for changes and start to replicate              ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

emitter.on('dbChanged', data => {
  state.waiting += 1;
  pushReplication(data);
});
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Network status has changed.                            ┃
//┃   Send a notification and update the state.              ┃
//┃   If the network has been restored then restart the      ┃
//┃   replication processes                                  ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

let notifyRecent = '';
function notify(status) {
  const message = {
    offline: `Connection Lost.😟  Internet connection is not available.`,
    unreachable: `Connection Lost.😟  Internet connection seems to be working but the server isn't reponding.
               Pleaase inform Aidan of the situation.`,

    paused: 'Connection to server restablished 😊 👍 ',
  };
  if (state.current === status) return;
  if (!/(offline|unreachable|paused|error)/.test(state.current)) return;
  logit('notify', status, state.current, notifyRecent);
  state.current = status;
  state.lastAction = 'online check';
  if (status === notifyRecent) return;
  if (status === 'paused' && state.waiting > 0) pushReplication();
  if (status === 'paused') setTimeout(pullReplication, 100);
  notifyRecent = status;
  new Notification('Booking System Internet Conection', {
    body: message[status],
    icon: path.join(__dirname, '../assets/steds-logo.jpg'), // Absolute path (doesn't work on balloons)
    time: 0,
  });
  // if the network is bouncing don't send multiple messages
  setTimeout(() => {
    logit('reset notifyRecent', notifyRecent);
    notifyRecent = '';
  }, 120000);
}
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Validate that we can still reach our server.           ┃
//┃   If not check if we can see google to distinguish       ┃
//┃   between network problems and server problems.          ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

function checkInternet() {
  try {
    remoteDB
      .info()
      .then(() => notify('paused'))
      .catch(() => {
        fetch('http://www.google.co.uk:80', { cache: 'no-cache' })
          .then(() => notify('reachable'))
          .catch(() => notify('offline'));
      });
  } catch (error) {
    logit('checkInternet', error);
  }
}

setInterval(checkInternet, 60000);
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Common routine to update state when replications       ┃
//┃   normally                                               ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

const replicationDone = async (seq, action) => {
  logit(action, seq);
  if (!seq) seq = (await db.info()).update_seq;
  state.curr_seq = seq;
  state.lastAction = action;
  state.current = 'paused';
  // localStorage.setItem('stEdsReplSeq', seq);
};
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Push Replication - send changes to server              ┃
//┃   Runs once the stops. It is invoked every time we       ┃
//┃   receive a signal that a change has happed and          ┃
//┃   periodically in case we miss a notification            ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

async function pushReplication(data) {
  try {
    logit('start push replication', data);
    state.current = 'push';
    db.replicate
      .to(remoteDB)
      .on('complete', async info => {
        logit('push complete', info);
        state.pushed += state.waiting;
        state.waiting = 0;
        replicationDone(info.last_seq, 'push complete');
      })
      .on('active', () => {
        logit('push active');
        state.lastAction = 'push started';
        state.current = 'push';
      })
      .on('error', err => {
        logit('on push error', err);
        state.current = 'paused';
        checkInternet();
      });
  } catch (err) {
    logit('push catch error', err);
  }
}

setInterval(pushReplication, 180000); // just in case a signal failed

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Pull replication - get changes that have happened      ┃
//┃   elsewhere. This runs live so is permanently running    ┃
//┃   unless a problem such as network failure stops it.     ┃
//┃   It is checked and every 3 minutes and restarted if     ┃
//┃   stopped.                                               ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

async function pullReplication() {
  if (state.pullOn) return;
  try {
    state.pullOn = true;
    db.replicate
      .from(remoteDB, {
        live: true,
        timeout: 60000,
        // retry: true,
      })
      .on('change', async () => {
        // logit('pull change', info);
        replicationDone(null, 'pull change');
      })
      .on('paused', async () => {
        // logit('pull paused');
        // const info = await db.info();
        replicationDone(null, 'pull paused');
      })
      .on('active', info => {
        logit('pull active', info);

        state.lastAction = 'pull started';
        state.current = 'pull';
      })
      .on('error', err => {
        logit('on pull error', err);
        state.current = 'paused';
        state.pullOn = false;
        checkInternet();
      });
  } catch (err) {
    logit('sync error', err);
    logit('send restart request');
  }
}
setInterval(pullReplication, 180000); // just in case it's stopped

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Initialize replication and monitoring.                 ┃
//┃   This is invoked by index.js                            ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

async function monitorReplications(dbset) {
  logit('Start Monitoring');
  db = dbset;
  const remoteCouch = `http://${DbSettings.remotehost}:5984/${DbSettings.remotename}`;
  try {
    PouchDB.plugin(require('pouchdb-authentication'));
    if (!localStorage.getItem('stEdsSignin')) return;
    const { username, password } = JSON.parse(localStorage.getItem('stEdsSignin'));

    remoteDB = new PouchDB(remoteCouch, { skip_setup: true });
    var resp = await remoteDB.login(username, password, {
      ajax: {
        body: { name: username, password: password },
      },
    });
    logit('login resp:', resp);
    // initial state from the database
    const { update_seq } = await db.info();
    state.start_seq = state.curr_seq = update_seq - state.waiting;
    // start replication
    if (state.waiting > 0) pushReplication();
    setTimeout(pullReplication, 1000);
  } catch (err) {
    logit('sync error', err);
  }
}
exports.monitorReplications = monitorReplications;

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Component to display the replcation status             ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

const replicationStatus = observer(props => {
  const { className } = props;
  var xtra = {};
  if (state.pulled || state.curr_seq === 0) {
    xtra[`data-pulled`] = state.pulled;
  }
  if (state.waiting > 0) {
    xtra[`data-waiting`] = state.waiting;
  } else if (state.pushed) {
    xtra[`data-pushed`] = state.pushed;
  }
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
