const electron = require('electron');
const app = electron.app;
console.log(require('module').globalPaths);
const BrowserWindow = electron.BrowserWindow;
// import app from 'app';
// import BrowserWindow from 'browser-window';
const crashReporter = electron.crashReporter;
var mainWindow = null;
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
const POUCHDB_INSPECTOR = "hbhhpaojmpfimakffndmpmpndcmonkfa";
// console.log('env', process.env.NODE_PATH);
// process.env.NODE_PATH = __dirname;
// require('module').globalPaths.push(__dirname)
// console.log('env', process.env);
if(process.env.NODE_ENV === 'develop'){
  crashReporter.start();
  //appMenu.append(devMenu);
}

app.on('window-all-closed', () => {
  app.quit();
});


app.on('ready', ()=>{
  mainWindow = new BrowserWindow({width: 1280, height: 800, webPreferences: {experimentalFeatures: true, 'plugins': true}});
  installExtension(REACT_DEVELOPER_TOOLS)
  .then((name) => console.log(`Added Extension:  ${name}`))
  .catch((err) => console.log('An error occurred: ', err));
  installExtension(REDUX_DEVTOOLS)
  .then((name) => console.log(`Added Extension:  ${name}`))
  .catch((err) => console.log('An error occurred: ', err));
  installExtension(POUCHDB_INSPECTOR)
  .then((name) => console.log(`Added Extension:  ${name}`))
  .catch((err) => console.log('An error occurred: ', err));

  console.log('dirname', __dirname)
  mainWindow.loadURL('file://'+__dirname+'/index.tpl.html');
})
