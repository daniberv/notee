/// <reference types="vite/client" />

import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    require: (module: 'electron') => {
      ipcRenderer: IpcRenderer
    };
  }
}

const { ipcRenderer } = window.require('electron');