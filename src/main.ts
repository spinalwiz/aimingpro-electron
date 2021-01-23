import { app, ipcMain } from "electron";
import { GameWindow, SplashWindow } from "./controllers";
import { DiscordRPC, PreloadQueue, Settings, Updater } from "./services";
import { APClientSettings, cliSwitchHandler, consoleLogger, protocolURIParser } from "./utils";
import "v8-compile-cache";

const settings = Settings.getInstance();
/* set command line switches (mostly optimizations) */
cliSwitchHandler(settings.getSettings());

/* Instantiate the DiscordRPC and the Updater */
const discordRPC = DiscordRPC.getInstance();
const updater = new Updater();

const windows: {
    game: GameWindow;
    splash: SplashWindow;
} = {
    game: null,
    splash: null
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
    if (app.setAsDefaultProtocolClient(APClientSettings.PROTOCOL_PREFIX)) consoleLogger.warn("Protocol couldn't be attached");
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
            if (windows.game.getBrowserWindow().isMinimized()) windows.game.getBrowserWindow().restore();
            windows.game.getBrowserWindow().focus();

            protocolHandler(commandLine);
        }
    });
}

const protocolHandler = (arg: string[]): void => {
    const prot = protocolURIParser(arg);

    // if the game hasn't loaded yet, wait for the event
    if (windows.game == null) {
        ipcMain.once("gamewindow-ready", () => {
            // If there are any args check if the action is game and emit the load game event
            if (prot && prot.action === "game") windows.game.loadGame(+prot.parameter);
            if (prot && prot.action === "playlist") windows.game.loadPlaylist(+prot.parameter);
        });
    } else {
        // If there are any args check if the action is game and emit the load game event
        if (prot && prot.action === "game") windows.game.loadGame(+prot.parameter);
        if (prot && prot.action === "playlist") windows.game.loadPlaylist(+prot.parameter);
    }
};

/* EVENTS
 * From here on down it's mostly event handling.
 * This is probably going to be separated in the future.
 */

/* once all elements in splash screen are loaded open game screen and close splash screen */
ipcMain.once("preload-finished", () => {
    // close the preload object
    PreloadQueue.close();

    /* once preload is done run game screen */
    if (windows.game === null) windows.game = new GameWindow();

    // Make sure the handler is only executed after the call
    protocolHandler(process.argv);

    // Get rid off splash screen
    windows.splash.getBrowserWindow().close();
    windows.splash = null;
});

app.on("open-url", (event, args) => {
    event.preventDefault();
    protocolHandler(Array(args));
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
