import { app, ipcMain, webContents } from "electron";
import { BaseWindow } from "./baseWindow"

import * as path from 'path';

export class SplashWindow extends BaseWindow{
    constructor(){
        super({
            show: false,
            frame: false,
            transparent: true,
            center: true,
            resizable: false,
            height: 400,
            width: 500,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, '../../dist/splash-preload.js')
            }
        });
    }

    init(){
        /* init triggered */
        this.browserWindow.loadFile(path.join(__dirname, "../views/splash.html"));

        // Tell the updater we're ready to update
        this.browserWindow.once('ready-to-show', () => {
            ipcMain.emit('ready-for-update');
        })

        // Relay messages to window
        ipcMain.on('loadingscreen-status', (status) => {
            this.browserWindow.webContents.send('loadingscreen-status', status);
        })
    }
}