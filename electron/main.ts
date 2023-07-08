/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, shell, dialog } from 'electron'
import MenuBuilder from './menu';
import path from 'node:path';
import fs from 'fs';
import Store from 'electron-store';
import { initDb, getNotes, storeNote, deleteNote, updateNote } from '../server';
import ElectronGoogleOAuth2 from '@getstation/electron-google-oauth2'

const Database = require('better-sqlite3');
const db = new Database(`${app.getPath("userData")}/data/db.sqlite3`, {});
initDb(db)

const store = new Store();

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

ipcMain.on('windowCommand', async (event, command) => {
  const msgTemplate = (msg: string) => `windowCommand received: ${msg}`;
  event.reply('windowCommand', msgTemplate(`${command}`));

  if(win) {
    switch (command) {
      case 'minimize': {
        win.minimize();
        break;
      }
      case 'maximize': {
        win.maximize();
        break;
      }
      case 'unmaximize': {
        win.unmaximize();
        break;
      }
      case 'close': {
        win.hide();
        break;
      }
      default: {
        break;
      }
    }
  }
})

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'icon.png'),
    width: 1300,
    height: 728,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false
    },
  })

  const tray = new Tray(path.join(process.env.PUBLIC, 'icon.png'));
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Quit', click: function () {
        app.quit();
      }
    }
  ]));
  tray.on("click", () => {
    win.show();
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // @ts-ignore
  win.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  win.on('ready-to-show', () => {
    if (!win) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      win.minimize();
    } else {
      win.show();
    }
  });

  win.on('closed', () => {
    win = null;
  });

  const menuBuilder = new MenuBuilder(win);
  menuBuilder.buildMenu();
}

app.on('browser-window-focus', () => {
  globalShortcut.register('Esc', () => {
    win.minimize();
    return true;
  })
})

app.on('browser-window-blur', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  win = null
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }

    console.log('commandLine', commandLine.pop().includes('auth=success'))
    // TODO authorized
  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow()
  })
}

app.on('ready', () => {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('notee', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('notee')
  }
})

ipcMain.handle('storeNote', (event, sql, param = {}) => 
  storeNote(db, sql.title),
)

ipcMain.handle('deleteNote', (event, sql, param = {}) => {
  const dataPath = app.getPath("userData")

  if(fs.existsSync(`${dataPath}/data/${sql.rowId}`)) {
    fs.rmSync(`${dataPath}/data/${sql.rowId}`, { recursive: true, force: true })
  }

  return deleteNote(db, sql.rowId)
})

ipcMain.handle('updateNote', (event, sql, param = {}) =>
  updateNote(db, sql.rowId, sql.title, sql.about, JSON.stringify(sql.body), sql.cover)
)

ipcMain.handle('getNotes', (event, sql, param = {}) =>
  getNotes(db),
)

ipcMain.on('ipc', (event, arg) => {
  event.sender.send(arg)
})

ipcMain.handle('uploadImage', (event, sql, param = {}) => {
  const dataPath = app.getPath("userData")

  if(!fs.existsSync(`${dataPath}/data`)) {
    fs.mkdirSync(`${dataPath}/data`)
  }

  if(!fs.existsSync(`${dataPath}/data/${sql.dir}`)) {
    fs.mkdirSync(`${dataPath}/data/${sql.dir}`)
  }

  fs.copyFileSync(sql.file, sql.newName)
  return true
})

ipcMain.handle('deleteImage', (event, sql, param = {}) => {
  if(fs.existsSync(sql)) {
    fs.unlinkSync(sql)
  }
  return true
})

ipcMain.handle('getPath', () => app.getPath("userData"));

ipcMain.handle('openPath', (event, id) => {
  const dataPath = app.getPath("userData")

  if(!fs.existsSync(`${dataPath}/data`)) {
    fs.mkdirSync(`${dataPath}/data`)
  }

  if(!fs.existsSync(`${dataPath}/data/${id}`)) {
    fs.mkdirSync(`${dataPath}/data/${id}`)
  }

  shell.openExternal(`${dataPath}/data/${id}`)
});

ipcMain.handle('getTheme', () => store.get('theme'))
ipcMain.handle('setTheme', (event, theme) => store.set('theme', theme))

ipcMain.handle('login', (event, id) => {
  const myApiOauth = new ElectronGoogleOAuth2(
    process.env.VITE_GOOGLE_CLIENT_ID,
    process.env.VITE_GOOGLE_CLIENT_TOKEN,
    ['https://www.googleapis.com/auth/userinfo.email'],
    { successRedirectURL: 'notee://' }
  );

  myApiOauth.openAuthWindowAndGetTokens()
    .then(token => {
      // use your token.access_token
      console.log('token', token)
      // email https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token.access_token}

      // {
      //   "sub": "109893831850465967267",
      //   "name": "VVV VVV",
      //   "given_name": "VVV",
      //   "family_name": "VVV",
      //   "picture": "https://lh3.googleusercontent.com/a/AAcHTtdXb0LdytCRlyFoCbXE_q6j5lBaqGeN6tCSTTqECA=s96-c",
      //   "email": "zarkonvvv@gmail.com",
      //   "email_verified": true,
      //   "locale": "en"
      // }
    });
})