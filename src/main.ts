import { app, ipcMain, clipboard } from "electron";
import { SplashWindow, GameWindow, SettingsWindow } from "./controllers";
import { Settings, DiscordRPC, Updater, PreloadQueue } from "./services";
import { constant, protocolHandler, cliSwitchHandler } from "./utils";
import "v8-compile-cache";
import * as isDev from "electron-is-dev";

const settings = Settings.getInstance();
/* set command line switches (mostly optimizations) */
cliSwitchHandler(settings.getSettings());

// TODO: IMPROVE SETTINGS

/* Instantiate the DiscordRPC and the Updater */
const discordRPC = DiscordRPC.getInstance();
const updater = new Updater();

const windows: {
    game: GameWindow;
    splash: SplashWindow;
    settings: SettingsWindow;
} = {
    game: null,
    splash: null,
    settings: null,
};

/* APP INITIALIZATION
 */
app.on("ready", () => {
    // This emits 'preload-finished' when all given events have fired on ipcMain which starts the GameWindows
    PreloadQueue.start(["update-finished"]);

    // initialize splash window
    windows.splash = new SplashWindow();

    // Check for updates
    updater.check();

    // Set windows to use aimingpro as default protocol
    app.setAsDefaultProtocolClient(constant.PROTOCOL_PREFIX);
});

// prevent second instance of app from running
const gotTheLock: boolean = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    // Focus on app window if someone tried to open a second instance
    app.on("second-instance", (e, commandLine) => {
        // Someone tried to run a second instance, we should focus our window.
        if (windows.game) {
            // Focus on main window if second instance is attempted
            if (windows.game.browserWindow.isMinimized())
                windows.game.browserWindow.restore();
            windows.game.browserWindow.focus();

            /* If a second instance is opened check if it's trying to open a new game */
            const prot = protocolHandler(commandLine);
            // If there are any args check if the action is game and emit the load game event
            if (prot && prot.action === "game") {
                windows.game.loadGame(+prot.parameter);
            }
        }
    });
}

/* EVENTS
 * From here on down it's mostly event handling.
 * This is probably going to be separated in the future.
 */

/* Create Settings instance on 'open-settings' event */
ipcMain.on("open-settings", () => {
    windows.settings = new SettingsWindow();
});

/* once all elements in splash screen are loaded open game screen and close splash screen */
ipcMain.once("preload-finished", () => {
    // close the preload object
    PreloadQueue.close();

    /* once preload is done run game screen */
    if (!windows.game) windows.game = new GameWindow();

    const prot = protocolHandler(process.argv);

    // If there are any args check if the action is game and emit the load game event
    if (prot && prot.action === "game") {
        windows.game.loadGame(+prot.parameter);
    }

    // Get rid off splash screen
    windows.splash.browserWindow.close();
    windows.splash = null;
});

/* Forcefully closes the app */
ipcMain.on("force-close-app", () => {
    app.quit();
});

/* Forcefully closes the app */
ipcMain.on("force-reload-app", () => {
    app.relaunch();
});

/* Quits the app if all windows are closed */
app.on("window-all-closed", () => {
    // Clear discord RPC
    discordRPC.clear();
    app.quit();
});

/**
 * Needs to be deleted in the future.
 * TODO: Delegate to a settings class.
 */

/* Toggle auto fullscreen */
ipcMain.on("autofullscreen", (e) => {
    settings.setSettings("fullscreenOnGameStart", e);
});

/* Toggle unlimited fps */
ipcMain.on("unlimitedfps", (e) => {
    settings.setSettings("unlimitedfps", e);
    app.relaunch();
    app.exit();
});

/* Toggle vsync */
ipcMain.on("vsync", (e) => {
    settings.setSettings("vsync", e);
    if ((e as any) === true) settings.setSettings("unlimitedfps", false);
    app.relaunch();
    app.exit();
});

/* Copy GPU Info to clipboard */
ipcMain.on("copygpuinfo", () => {
    app.getGPUInfo("complete").then((e) => {
        clipboard.writeText(JSON.stringify(e, null, 1));
    });
});
