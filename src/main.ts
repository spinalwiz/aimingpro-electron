import { app, ipcMain, clipboard } from "electron";
import { SplashWindow, GameWindow, SettingsWindow } from "./controllers";
import { Settings, DiscordRPC } from "./services";
import { constant, protocolHandler, cliSwitchHandler } from "./utils";
import "v8-compile-cache";

// Set debug to true if --dev vlaf is found in args
const DEBUG = process.argv.includes("--dev");

import electronDebug = require("electron-debug");

if (DEBUG) electronDebug();

const settings = Settings.getInstance();
const discordRPC = DiscordRPC.getInstance();
/* set command line switches (mostly optimizations) */
cliSwitchHandler(settings.getSettings());

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
  /* initialize splash window */
  windows.splash = new SplashWindow();
  /* Set windows to use aimingpro as default protocol */
  app.setAsDefaultProtocolClient(constant.PROTOCOL_PREFIX);
  // call the updater
  //updater();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  discordRPC.clear();
  app.quit();
});

/* Auto Updater */

ipcMain.on("ready-for-update", () => {
  // Only use the updater if not currently in debug mode
  //if(!DEBUG) initUpdater();
});

// log all update events DEBUG
ipcMain.on("update", (...args) => {
  console.log(args);
});

/* prevent second instance of app from running */
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
ipcMain.on("preload-finished", () => {
  /* once preload is done */
  windows.game = new GameWindow();
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

/* Testing purposes
    const vendorId : number = (e as any).gpuDevice[0].vendorId;
    const deviceId : number = (e as any).gpuDevice[0].deviceId;
    console.log(dec2hexString(vendorId) +  dec2hexString(deviceId) );
    */
