import settings from 'electron-settings';
// import { TypeFlags } from 'typescript';

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
      useFullHistory: false,
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
  existing = settings.getAll();
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

console.log('V3 Electron-settings', { defaults, existing, newValues });
settings.setAll(newValues);
exports.mode = settings.get('database.current');
exports.DbSettings = settings.get(`database.${exports.mode}`);
console.log('settings DbSettings', exports);
exports.useFullHistory = exports.DbSettings.useFullHistory;
exports.resolveConflicts = exports.DbSettings.resolveConflicts;

exports.getAllSettings = () => settings.getAll();
exports.getSettings = field => settings.get(field);
exports.setSettings = (field, value) => {
  console.log(`setting ${field} = ${value}`);
  settings.set(field, value, { prettify: true });
};
exports.lockSettings = settings.get('lock');
console.log('lock values', exports);
console.log('setting File', settings.file());
