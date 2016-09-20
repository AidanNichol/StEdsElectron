const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
require('index');
var mainWindow = null;

app.on('ready', ()=>{
  mainWindow = new BrowserWindow({width: 1280, height: 800, 'web-preferences': {'plugins': true}});
  app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
  console.log('dirname', __dirname)
  mainWindow.loadURL(`file://${__dirname}/elec.html`);
})
