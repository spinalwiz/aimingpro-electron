import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from "electron";

import * as path from "path";
import { APClientSettings, consoleLogger } from "../utils";
import { APBrowserWindow } from "../types";

export class SplashWindow implements APBrowserWindow {
    private readonly browserWindow: BrowserWindow;

    constructor() {
        const browserOptions: BrowserWindowConstructorOptions = {
            show: false,
            frame: false,
            transparent: true,
            center: true,
            resizable: false,
            height: 400,
            width: 500,
            titleBarStyle: "hidden",
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        };

        /* use default options if none are provided */
        if (this.browserWindow == null) this.browserWindow = new BrowserWindow(browserOptions);

        /* Set default custom user agent */
        this.browserWindow.webContents.setUserAgent(
            this.browserWindow.webContents.getUserAgent() + APClientSettings.userAgentSuffix
        );

        this.init();

        // Make sure window is destroyed when closed (NOT MINIMZED).
        // Still needs nullifying reference to this object.
        this.browserWindow.on("close", () => {
            this.browserWindow.destroy();
        });

        // Gracefully show windows
        this.browserWindow.on("ready-to-show", () => {
            this.browserWindow.show();
        });
    }

    init() {
        /* init triggered */
        this.browserWindow.loadFile(
            path.join(__dirname, "../views/splash.html")
        ).catch(consoleLogger.critical);

        // Tell the updater we're ready to update
        this.browserWindow.once("ready-to-show", () => {
            ipcMain.emit("ready-for-update");
        });

        // Relay messages to window
        ipcMain.on("loadingscreen-status", (status) => {
            this.browserWindow.webContents.send("loadingscreen-status", status);
        });
    }

    getBrowserWindow(): Electron.BrowserWindow {
        return this.browserWindow;
    }
}
