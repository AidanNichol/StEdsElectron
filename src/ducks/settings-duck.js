import settings from 'electron-settings'

settings.defaults({
  lock: {enabled: true, delay:5000},
  debug: {devtoolsOpen: false, database: false, reduxLogger: false},
  database: {current: 'production',
    production: {localname: 'stEdsBookings', remotename: 'bookings', remotehost: 'nicholware.com', },
    developement: {localname: 'devbookings', remotename: 'devbookings', remotehost: '127.0.0.1', user: 'aidan', password: 'admin'}
  }
})
settings.configure({prettify: true})
settings.applyDefaultsSync();
export const getSettings = (field)=>settings.getSync(field);
export const setSettings = (field, value)=>settings.setSync(field, value);
export const lockSettings = settings.getSync('lock')
console.log('lock values', lockSettings)
console.log('setting File', settings.getSettingsFilePath())