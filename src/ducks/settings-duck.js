import settings from 'electron-settings';
import Logit from '../factories/logit.js';
var logit = Logit('color:white; background:brown;', 'electron:settings');

let defaults = {
  user: {
    current: 'aidan',
    sandy: { password: '', roles: ['bookings', 'steds'] },
    pat: { password: '', roles: ['bookings', 'steds'] },
    aidan: { password: '', roles: ['admin', 'steds'] },
    val: { password: '', roles: ['membership', 'steds'] }
  },

  lock: { enabled: false, delay: 5000 },
  calculation: { useFullHistory: true },
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
      resetLocalUser: false
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
      resetLocalUser: false
    }
  },
  advanced: false
};
let existing = settings.getAll();
let newValues = { ...defaults, ...existing };
delete newValues.debug.reduxLogger;
delete newValues.database.developement.resetLocal;
delete newValues.database.production.resetLocal;
delete newValues.clearRouter;
logit('V3 Electron-settings', { defaults, existing, newValues });
settings.setAll(newValues);
export const mode = settings.get('database.current');
export const useFullHistory = settings.get('calculation.useFullHistory');
export const DbSettings = settings.get(`database.${mode}`);
logit('settings DbSettings', { mode, DbSettings });

export const getAllSettings = () => settings.getAll();
export const getSettings = field => settings.get(field);
export const setSettings = (field, value) => {
  logit(`setting ${field} = ${value}`);
  settings.set(field, value, { prettify: true });
};
export const lockSettings = settings.get('lock');
logit('lock values', lockSettings);
logit('setting File', settings.file());
