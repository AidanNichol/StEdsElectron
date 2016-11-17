import settings from 'electron-settings'

settings.defaults({
  lock: {enabled: true, delay:5000},
  debug: {devtoolsOpen: false, database: false, reduxLogger: false},
  database: {current: 'production',
    production: {localname: 'stEdsBookings', remotename: 'bookings', remotehost: 'nicholware.com', localUsers: '_users', resetLocal: false},
    developement: {localname: 'devbookings', remotename: 'devbookings', remotehost: '127.0.0.1', user: 'aidan', password: 'admin', localUsers: 'devUsers', resetLocal: false}
  }
})
settings.configure({prettify: true})
settings.applyDefaultsSync();
  // const mode = settings.getSync('database.current');
  // const db = settings.getSync(`database.${mode}`);
  // console.log('settings db', {mode, db})

export const mode = settings.getSync('database.current');
export const DbSettings = settings.getSync(`database.${mode}`);
console.log('settings DbSettings', {mode, DbSettings})

export const getSettings = (field)=>settings.getSync(field);
export const setSettings = (field, value)=>settings.setSync(field, value);
export const lockSettings = settings.getSync('lock')
console.log('lock values', lockSettings)
console.log('setting File', settings.getSettingsFilePath())
