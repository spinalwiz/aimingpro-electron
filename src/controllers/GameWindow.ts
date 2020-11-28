import { app, session, ipcMain, protocol, net } from "electron";
import * as path from "path";
import { BaseWindow } from "./baseWindow";
import { mainDropDownMenu } from "../utils/dropdownMenu";
import { constant } from "../utils/constant";

import { Settings } from "../services/Settings";
import { GameState } from "../types";

export class GameWindow extends BaseWindow {
  constructor() {
    super({
      webPreferences: {
        preload: path.join(__dirname, "../../dist/game-preload.js"),
      },
      show: false,
      frame: true,
    });
  }

  init() {
    this.browserWindow.loadURL(constant.baseUrl);

    // load maximzed
    this.browserWindow.maximize();
    this.browserWindow.setMenu(mainDropDownMenu);

    this.initShortcuts();
    this.initEvents();
  }

  // Check if user is logged in by looking for specific cookies
  async isLoggedIn(): Promise<boolean> {
    const cookies = await session.defaultSession.cookies.get({
      url: constant.baseUrl,
    });

    for (const i in cookies) {
      if (cookies[i].name.startsWith("remember_web_") === true) return true;
    }

    return false;
  }

  loadGame(gameId: number): void {
    if (isNaN(gameId)) return;
    // TODO: Check if the game actually exists
    this.isLoggedIn().then((e) => {
      // if not logged in redirect to login page
      const href = e ? constant.gameBaseUrl + gameId : constant.baseUrl + "login";
      this.browserWindow.loadURL(href);
    });
  }

  private initShortcuts() {
    this.browserWindow.webContents.on("before-input-event", (event, input) => {
      // Open devtools | Ctrl+Shift+i
      if (input.control && input.shift && input.key.toLowerCase() === "i") {
        this.browserWindow.webContents.openDevTools();
      }
    });
  }

  // Setup Event Handlers
  private initEvents() {
    // Make sure iFrames are intercepted and opened as a full window
    ipcMain.on("game-iframe-opened", (e, gameId: number) => {
      // Make sure it's a numer to prevent any sort of injection
      this.loadGame(gameId);
    });

    /* automatic fullscreen on game screen | Also hide menu bars automatically */
    ipcMain.on("gamewindow", (e, arg: GameState) => {
      const tempSettings = Settings.getInstance().getSettings();

      if (arg === GameState.Opened) {
        if (tempSettings.fullscreenOnGameStart)
          this.browserWindow.setFullScreen(true);
        this.browserWindow.setMenuBarVisibility(false);
      } else if (arg === GameState.Closed) {
        if (tempSettings.fullscreenOnGameStart)
          this.browserWindow.setFullScreen(false);
        this.browserWindow.setMenuBarVisibility(true);
      }
    });
  }
}