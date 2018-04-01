import settings from 'electron-settings';

let defaults = {
  user: {
    current: 'aidan',
    sandy: { password: '', roles: ['bookings', 'steds'] },
    pat: { password: '', roles: ['bookings', 'steds'] },
    aidan: { password: '', roles: ['admin', 'steds'] },
    ray: { password: '', roles: ['membership', 'steds'] },
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
      resetLocalUser: false,
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
let newValues = { ...defaults, ...existing };
delete newValues.debug.reduxLogger;
delete newValues.database.developement.resetLocal;
delete newValues.database.production.resetLocal;
delete newValues.database.developement.resetLocalBooking;
delete newValues.database.production.resetLocalBooking;
delete newValues.clearRouter;
console.log('V3 Electron-settings', { defaults, existing, newValues });
settings.setAll(newValues);
export const mode = settings.get('database.current');
export const useFullHistory = settings.get('calculation.useFullHistory');
export const DbSettings = settings.get(`database.${mode}`);
console.log('settings DbSettings', { mode, DbSettings });

export const getAllSettings = () => settings.getAll();
export const getSettings = field => settings.get(field);
export const setSettings = (field, value) => {
  console.log(`setting ${field} = ${value}`);
  settings.set(field, value, { prettify: true });
};
export const lockSettings = settings.get('lock');
console.log('lock values', lockSettings);
console.log('setting File', settings.file());
