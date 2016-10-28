import 'babel-polyfill'
const electron = require('electron');
// const {Menu} = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
import { spawn } from "child_process"
import * as path from "path"


// import app from 'app';
// import BrowserWindow from 'browser-window';
// const crashReporter = electron.crashReporter;
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
const POUCHDB_INSPECTOR = "hbhhpaojmpfimakffndmpmpndcmonkfa";

let mainWindow,
    loadingScreen,
    windowParams = {
      width: 1280,
      height: 774,
      x: 0,
      y: 100,
      show: false,
      webPreferences: {experimentalFeatures: true}
    };
// if(process.env.ENV !== 'development'){
//   crashReporter.start();
//   //appMenu.append(devMenu);
// }
app.on('window-all-closed', () => {
  app.quit();
});
function isDev() {
  return app.getPath("exe").includes("/node_modules/electron/");
}
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow(windowParams);
    // if(isDev()){
    //   installExtension(REACT_DEVELOPER_TOOLS)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err));
    //   installExtension(REDUX_DEVTOOLS)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err));
    //   installExtension(POUCHDB_INSPECTOR)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err));
    // }
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // mainWindow.setProgressBar(-1); // hack: force icon refresh
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();

        if (loadingScreen) {
            let loadingScreenBounds = loadingScreen.getBounds();
            mainWindow.setBounds(loadingScreenBounds);
            loadingScreen.close();
        }
    });

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    require('electron-debug')({showDevTools: true});

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    })
}

function createLoadingScreen() {
    loadingScreen = new BrowserWindow(Object.assign(windowParams, {parent: mainWindow}));
    loadingScreen.loadURL('file://' + __dirname + '/loading.html');
    loadingScreen.on('closed', () => loadingScreen = null);
    loadingScreen.webContents.on('did-finish-load', () => {
        loadingScreen.show();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
});

app.on('ready', ()=>{
  createLoadingScreen();
  createWindow();
})

function run(args: string[], done: Function): void {
  const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe")
  console.log("Spawning `%s` with args `%s`", updateExe, args)
  spawn(updateExe, args, {
    detached: true
  })
    .on("close", done)
}

export default function handleStartupEvent(): boolean {
  if (process.platform !== "win32") {
    return false
  }

  const cmd = process.argv[1]
  console.log("Processing squirrel command `%s`", cmd)
  const target = path.basename(process.execPath)
  if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
    run(['--createShortcut=' + target + ''], app.quit)
    return true
  }
  else if (cmd === "--squirrel-uninstall") {
    run(['--removeShortcut=' + target + ''], app.quit)
    return true
  }
  else if (cmd === "--squirrel-obsolete") {
    app.quit()
    return true
  }
  else {
    return false
  }
}
