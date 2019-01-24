/* global PouchDB */
const React = require('react');
let db;
const styled = require('styled-components').default;
const { observable, computed, autorun, toJS, decorate } = require('mobx');
const { observer } = require('mobx-react');
const { DbSettings } = require('StEdsSettings');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloud,
  faServer,
  faWifi,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/pro-solid-svg-icons';

const emitter = require('StEdsStore').eventBus;
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
    this.waiting = parseInt(localStorage.getItem('stEdsWaiting')) || 0;
    this.pushed = 0;
    this.curr_seq = 0;
    this.start_seq = 0;
    this.pullOn = false;
    this.pullActive = false;
    this.pushActive = false;
    this.internet = 'ok';
  }

  get pulled() {
    return this.curr_seq - this.start_seq - this.pushed;
  }
}
decorate(ReplState, {
  curr_seq: observable,
  start_seq: observable,
  waiting: observable,
  pushed: observable,
  pushActive: observable,
  pullActive: observable,
  internet: observable,
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

function notify(status) {
  const message = {
    offline: `Connection Lost.😟  Internet connection is not available.`,
    unreachable: `Connection Lost.😟  Internet connection seems to be working but the server isn't reponding.
               Pleaase inform Aidan of the situation.`,

    ok: 'Connection to server restablished 😊 👍 ',
  };
  if (state.internet === status) return;
  logit('notify', status, state.internet);
  state.internet = status;
  // if (status === notifyRecent) return;
  if (status === 'ok') {
    if (state.start_seq === 0) monitorReplications();
    else {
      if (state.waiting > 0) pushReplication();
      setTimeout(pullReplication, 100);
    }
  }
  new Notification('Booking System Internet Conection', {
    body: message[status],
    icon: path.join(__dirname, '../assets/steds-logo.jpg'),
    time: 0,
  });
}
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Validate that we can still reach our server.           ┃
//┃   If not check if we can see google to distinguish       ┃
//┃   between network problems and server problems.          ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

function checkInternet() {
  if (!remoteDB) return;
  try {
    remoteDB
      .info()
      .then(() => notify('ok'))
      .catch(() => {
        fetch('http://www.google.co.uk:80', { cache: 'no-cache' })
          .then(() => notify('unreachable'))
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
  state.lastAction = action;
  if (!seq) seq = (await db.info()).update_seq;
  state.curr_seq = seq;
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
    db.replicate
      .to(remoteDB)
      .on('complete', async info => {
        logit('push complete', info);
        state.pushActive = false;
        state.pushed += state.waiting;
        state.waiting = 0;
        replicationDone(info.last_seq, 'push complete');
      })
      .on('active', () => {
        logit('push active');
        state.pushActive = true;
        state.lastAction = 'push active';
      })
      .on('error', err => {
        logit('on push error', err);
        state.lastAction = 'push error';
        state.pushActive = false;
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
        replicationDone(null, 'pull change');
      })
      .on('paused', async () => {
        state.pullActive = false;
        replicationDone(null, 'pull paused');
      })
      .on('active', () => {
        state.lastAction = 'pull active';
        state.pullActive = true;
      })
      .on('error', () => {
        state.lastAction = 'pull error';
        state.pushActive = false;
        state.pullOn = false;
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
  db = dbset ? dbset : db;
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
    checkInternet();
    const { update_seq } = await db.info();
    state.start_seq = state.curr_seq = update_seq - state.waiting;
    // start replication
    if (state.waiting > 0) pushReplication();
    setTimeout(pullReplication, 1000);
  } catch (err) {
    logit('sync error', err);
    checkInternet();
  }
}
exports.monitorReplications = monitorReplications;

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Component to display the replcation status             ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

const ReplicationStatus = observer(({ className }) => {
  const { pushed, pulled, waiting, internet, pushActive, pullActive } = state;
  // internet = 'unreachable';
  const UpArrow = () => (
    <FontAwesomeIcon icon={faArrowUp} inverse transform="shrink-10 right-6 down-1" />
  );
  const DownArrow = () => (
    <FontAwesomeIcon icon={faArrowDown} inverse transform="shrink-10 left-5 up-1" />
  );
  const Wifi = () => (
    <FontAwesomeIcon
      icon={faWifi}
      transform="shrink-7"
      style={{ color: internet === 'ok' ? 'green' : 'orange' }}
    />
  );
  const Server = () => (
    <FontAwesomeIcon icon={faServer} transform="shrink-7" style={{ color: 'red' }} />
  );
  const PulledCounter = () => (
    <span
      className="fa-layers-counter fa-layers-bottom-left"
      style={{ background: 'blue' }}
    >
      {pulled}
    </span>
  );
  const PushedCounter = ({ count, color }) => (
    <span className="fa-layers-counter" style={{ background: color }}>
      {count}
    </span>
  );
  const count = waiting ? waiting : pushed;
  const color = waiting ? 'red' : 'green';
  return (
    <div className={className + ' fa-3x'}>
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={faCloud} transform="grow-1 up-2" />
        {internet === 'unreachable' ? <Server /> : <Wifi />}
        {pushActive ? <UpArrow /> : null}
        {pullActive ? <DownArrow /> : null}
        {count ? <PushedCounter count={count} color={color} /> : null}
        {pulled ? <PulledCounter /> : null}
      </span>
    </div>
  );
});

exports.ReplicationStatus = ReplicationStatus;
