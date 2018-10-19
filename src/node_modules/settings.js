const Conf = require('conf');
const fs = require('fs');
let settings = new Conf();
if (!fs.existsSync('/Users/aidan/Library/Preferences/stedsbookings-nodejs/config.json')) {
  const settingsE = require('electron-settings');
  settings.store = settingsE.getAll();
}
// settings
//   .argv()
//   .env()
//   .file({ file: '/Users/aidan/Library/Application Support/Electron/Settings' });
let defaults = {
  user: {
    current: 'aidan',
    sandy: { password: '', roles: ['bookings', 'steds'] },
    pat: { password: '', roles: ['bookings', 'steds'] },
    aidan: { password: '', roles: ['admin', 'steds'] },
    ray: { password: '', roles: ['membership', 'steds'] },
  },

  lock: { enabled: false, delay: 5000 },
  debug: { devtoolsOpen: false, database: false },
  router: { clear: true, enabled: false },
  machine: { name: '' },
  database: {
    current: 'production',
    production: {
      localname: 'stEdsBookings',
      resetLocalBookings: false,
      adapter: 'websql',
      remotename: 'bookings',
      remotehost: 'nicholware.com',
      localUsers: '_users',
      resetLocalUser: false,
      useFullHistory: true,
      resolveConflicts: false,
    },
    developement: {
      localname: 'devbookings',
      resetLocalBookings: false,
      adapter: 'websql',
      remotename: 'devbookings',
      remotehost: '127.0.0.1',
      user: 'aidan',
      password: 'admin',
      localUsers: 'devUsers',
      resetLocalUser: false,
      useFullHistory: true,
      resolveConflicts: false,
    },
  },
  advanced: false,
};
let existing = {};
try {
  existing = settings.store;
} catch (error) {
  console.log('get setting', error);
}
function upgradeObject(newVal, old) {
  Object.keys(newVal).forEach(key => {
    let value = newVal[key];
    if (typeof value === 'object' && typeof old[key] === 'object')
      upgradeObject(newVal[key], old[key]);
    else if (old[key] !== undefined) newVal[key] = old[key];
  });
}
let newValues = { ...defaults };
upgradeObject(newValues, existing);

settings.store = newValues;
if (settings.get('machine.name') === '') {
  require('getmac').getMac(function(err, macAddress) {
    if (err) throw err;
    settings.set('machine.name', macAddress);
    console.log(macAddress);
  });
}
exports.machine = settings.get('machine.name');
exports.mode = settings.get('database.current');
exports.DbSettings = settings.get(`database.${exports.mode}`);
console.log('settings DbSettings', exports);
exports.useFullHistory = exports.DbSettings.useFullHistory;
exports.resolveConflicts = exports.DbSettings.resolveConflicts;

exports.getAllSettings = () => settings.store;
exports.getSettings = field => settings.get(field);
exports.setSettings = (field, value) => {
  console.log(`setting ${field} = ${value}`);
  settings.set(field, value, { prettify: true });
};
exports.lockSettings = settings.get('lock');
console.log('lock values', exports);
console.log('setting File', settings.path);
