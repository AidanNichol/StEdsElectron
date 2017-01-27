import settings from 'electron-settings'
import Logit from '../factories/logit.js';
var logit = Logit('color:white; background:brown;', 'electron:settings');

settings.defaults({
  user: {current: 'aidan',
    sandy: {password: '', roles: ['bookings', 'steds']},
    pat: {password: '', roles: ['bookings', 'steds']},
    aidan: {password: '', roles: ['admin', 'steds']},
    val: {password: '', roles: ['membership', 'steds']}, },

  lock: {enabled: true, delay:5000},
  debug: {devtoolsOpen: false, database: false, reduxLogger: false},
  router: {clear: true, enabled: false},
  database: {current: 'production',
    production: {localname: 'stEdsBookings', resetLocalBookings: false,  adapter: 'websql',
        remotename: 'bookings', remotehost: 'nicholware.com',
        localUsers: '_users', resetLocalUser: false},
    developement: {localname: 'devbookings', resetLocalBookings: false, adapter: 'websql',
        remotename: 'devbookings', remotehost: '127.0.0.1',
        user: 'aidan', password: 'admin',
        localUsers: 'devUsers', resetLocalUser: false}
  },
  advanced: false
})
settings.configure({prettify: true})
settings.applyDefaultsSync();
settings.deleteSync('database.developement.resetLocal');
settings.deleteSync('database.production.resetLocal');
settings.deleteSync('clearRouter');
export const mode = settings.getSync('database.current');
export const DbSettings = settings.getSync(`database.${mode}`);
logit('settings DbSettings', {mode, DbSettings})

export const getSettings = (field)=>settings.getSync(field);
export const setSettings = (field, value)=>{
  logit(`setting ${field} = ${value}`)
  settings.setSync(field, value);
};
export const lockSettings = settings.getSync('lock')
logit('lock values', lockSettings)
logit('setting File', settings.getSettingsFilePath())
