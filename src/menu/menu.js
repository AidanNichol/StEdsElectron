import electron from 'electron';
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
function showAboutWindow() {
  var win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true },
  });
  win.loadURL(`file://${__dirname}/../windows/about.html`);
}
function showSettingsWindow() {
  var win = new BrowserWindow({
    width: 900,
    height: 750,
    webPreferences: { nodeIntegration: true },
  });
  win.loadURL(`file://${__dirname}/../windows/settings.html`);
}
function showDebugOptionsWindow() {
  var win = new BrowserWindow({
    width: 900,
    height: 750,
    webPreferences: { nodeIntegration: true },
  });
  win.loadURL(`file://${__dirname}/../windows/debugOptions.html`);
}
export var template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        },
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin') return 'Ctrl+Command+F';
          else return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        },
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin') return 'Alt+Command+I';
          else return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow) focusedWindow.toggleDevTools();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Edit Settings',
        click: showSettingsWindow,
      },
      {
        label: 'Debug Settings',
        click:  showDebugOptionsWindow,
      },
    ],
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
    ],
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() {
          require('electron').shell.openExternal('http://electron.atom.io');
        },
      },
      {
        label: 'About StEdwardsBookings',
        click: showAboutWindow,
      },
    ],
  },
];

if (process.platform == 'darwin') {
  var name = electron.remote.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        click: showAboutWindow,
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        label: 'Services',
        role: 'services',
        submenu: [],
      },
      {
        type: 'separator',
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers',
      },
      {
        label: 'Show All',
        role: 'unhide',
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
          electron.app.quit();
        },
      },
    ],
  });

  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator',
    },
    {
      label: 'Bring All to Front',
      role: 'front',
    },
  );
}
