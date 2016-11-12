import settings from 'electron-settings'

settings.defaults({
  lock: {enabled: true, delay:5000},
  database: {current: 'production',
    production: {localname: 'bookings', remotename: 'bookings', remotehost: 'nicholware.com', user: '', password: ''},
    developement: {localname: 'devbookings', remotename: 'devbookings', remotehost: '127.0.0.1', user: 'aidan', password: 'admin'}
  }
})
settings.configure({prettify: true})
settings.applyDefaultsSync();
export const lockSettings = settings.getSync('lock')
console.log('lock values', lockSettings)
console.log('setting File', settings.getSettingsFilePath())
