// import 'babel-polyfill'
// import './helpers.js'
// import 'whatwg-fetch';
require('steds-settings-setup').setup();
console.log('Versions', process.platform, process.versions);
const logo = __dirname + '/steds-logo.png';
console.log('logo', logo);
const electron = require('electron');
const { getSettings } =require( 'StEdsSettings');
// const {Menu} = require('electron');
const { app, BrowserWindow, ipcMain, shell } = electron;

let logoimage = electron.nativeImage.createFromPath(logo);
console.log(logoimage);

import installExtension, { REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS } from 'electron-devtools-installer';
const os = require('os');
const fs = require('fs');
const path = require('path');

const POUCHDB_INSPECTOR = 'hbhhpaojmpfimakffndmpmpndcmonkfa';
// var ESI = require('electron-single-instance');
app.setName('stedsbookings');
let mainWindow, printWorkerWindow, loadingScreen;
// let windowParams = { width: 1280, height: 774, x: 0, y: 100, show: false };
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
// if(process.env.ENV !== 'development'){
//   crashReporter.start();
//   //appMenu.append(devMenu);
// }
process.platform==='darwin' && app.dock.setIcon(logoimage);
app.on('window-all-closed', () => {
  app.quit();
});
function isDev() {
  return app.getPath('exe').includes('/node_modules/electron/');
}
function createWindow(width, height) {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width,
    height,
    x: 0,
    y: 0,
    show: false,
    logoimage,
  });
  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  
  // mainWindow.setProgressBar(-1); // hack: force icon refresh
  mainWindow.webContents.on('did-finish-load', () => {
    if (isDev()) {
      installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));
      installExtension(MOBX_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));
      installExtension(POUCHDB_INSPECTOR)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));
    }
    // Open the DevTools.
    if (getSettings('debug.devtoolsOpen')){
      mainWindow.webContents.openDevTools();
      console.log(`Added Extension:  Chrome Developer Tools`);
    }
    mainWindow.show();
    if (loadingScreen) {
      let loadingScreenBounds = loadingScreen.getBounds();
      mainWindow.setBounds(loadingScreenBounds);
      mainWindow.maximize();
      loadingScreen.close();
    }
  });

  // ESI.ensureSingleInstance('StEdsBookings', mainWindow); //mainWindow is optional
  // mainWindow.webContents.openDevTools();
  // require('electron-debug')({showDevTools: true});

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    printWorkerWindow && printWorkerWindow.close();
  });

  printWorkerWindow = new BrowserWindow({ webPreferences: { nodeIntegration: true, },});
  printWorkerWindow.hide();
  printWorkerWindow.loadURL('file://' + __dirname + '/windows/printWorker.html');
  printWorkerWindow.webContents.on('did-finish-load', () => {
    // printWorkerWindow.show();
    printWorkerWindow.hide();
  });
  // printWorkerWindow.webContents.openDevTools();
  printWorkerWindow.on('closed', () => {
    printWorkerWindow = undefined;
  });
}

function createLoadingScreen() {
  let windowParams = {  webPreferences: { nodeIntegration: false, },width: 1280, height: 774, x: 0, y: 100, show: false };
  loadingScreen = new BrowserWindow(Object.assign(windowParams, { parent: mainWindow }));
  loadingScreen.loadURL('file://' + __dirname + '/windows/loading.html');
  loadingScreen.on('closed', () => (loadingScreen = null));
  loadingScreen.webContents.on('did-finish-load', () => {
    loadingScreen.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  createLoadingScreen();
  createWindow(width, height);
  console.log('creating listeners');
  ipcMain.on('reload-main', (event, arg) => {
    console.log('reload request received', arg);
    event.sender.send('reload-reply', 'pong');
    mainWindow.reload();
  });
});

// retransmit it to printWorkerWindow
ipcMain.on('print', (event: any, content: any) => {
  console.log('print event', event, content);
  printWorkerWindow.webContents.send('print', content);
});
// when worker window is ready
ipcMain.on('readyToPrint', () => {
  // printWorkerWindow.webContents.print({});
});

// retransmit it to printWorkerWindow
ipcMain.on('printPDF', (event: any, content: any) => {
  console.log('printPDF event', event, content);
  printWorkerWindow.webContents.send('printPDF', content);
});
// when worker window is ready
ipcMain.on('readyToPrintPDF', (event, options) => {
  const { name = 'print' } = options;
  console.log('readyToPrintPDF', event);
  const pdfPath = path.join(os.tmpdir(), `${name}.pdf`);
  // Use default printing options
  printWorkerWindow.webContents.printToPDF(
    { printBackground: true, pageSize: 'A4' },
    function(error, data) {
      if (error) throw error;
      fs.writeFile(pdfPath, data, function(error) {
        if (error) {
          throw error;
        }
        shell.openItem(pdfPath);
        event.sender.send('wrote-pdf', pdfPath);
      });
    },
  );
});
