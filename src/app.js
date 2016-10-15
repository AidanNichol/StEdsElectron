const electron = require('electron');
const {Menu} = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
// import app from 'app';
// import BrowserWindow from 'browser-window';
// const crashReporter = electron.crashReporter;
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
var mainWindow = null;
const POUCHDB_INSPECTOR = "hbhhpaojmpfimakffndmpmpndcmonkfa";

// if(process.env.ENV !== 'development'){
//   crashReporter.start();
//   //appMenu.append(devMenu);
// }

app.on('window-all-closed', () => {
  app.quit();
});


app.on('ready', ()=>{
  mainWindow = new BrowserWindow({width: 1280, height: 800, x: 0, y: 100, webPreferences: {experimentalFeatures: true, 'plugins': true}});
  if(process.env.ENV === 'development'){
    installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
    installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
    installExtension(POUCHDB_INSPECTOR)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
    mainWindow.openDevTools();
  }
  console.log('memu', Menu.getApplicationMenu())
  mainWindow.loadURL('file://'+__dirname+'/index.tpl.html');
})
