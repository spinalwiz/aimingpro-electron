import { session, ipcMain, app } from "electron";
import * as path from "path";
import { BaseWindow } from "./baseWindow";
import { mainDropDownMenu } from "../schemas";
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
            frame: true
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
            if (cookies[i].name.startsWith("remember_web_") === true)
                return true;
        }

        return false;
    }

    loadGame(gameId: number): void {
        if (isNaN(gameId)) return;
        // TODO: Check if the game actually exists
        this.isLoggedIn().then((e) => {
            // if not logged in redirect to login page | Else load the game
            const href = e
                ? constant.gameBaseUrl + gameId
                : constant.baseUrl + "login";
            this.browserWindow.loadURL(href);
        });
    }

    private initShortcuts() {
        this.browserWindow.webContents.on(
            "before-input-event",
            (event, input) => {
                // Open devtools | Ctrl+Shift+i
                if (
                    input.control &&
                    input.shift &&
                    input.key.toLowerCase() === "i"
                ) {
                    this.browserWindow.webContents.openDevTools();
                }

                /*
      // Temporarily to open settings
      if (input.control && input.shift && input.key.toLowerCase() === "n") {
        ipcMain.emit('open-settings');
      }*/
            }
        );
    }

    // Setup Event Handlers
    private initEvents() {
        // If the game window is closed simulate window-all-closed
        this.browserWindow.on("close", (e) => {
            app.emit("window-all-closed");
        });

        ipcMain.on("clear-cache", () => {
            this.browserWindow.webContents.session.clearCache();
            this.browserWindow.webContents.session.clearStorageData();
            this.browserWindow.webContents.reload();
        });

        /* automatic fullscreen on game screen | Also hide menu bars automatically */
        ipcMain.on("gamewindow", (e, arg: GameState) => {
            const settings = Settings.getInstance().getSettings();
            // Fullscreen on gamestart if enabled
            if (settings.fullscreenOnGameStart)
                this.browserWindow.setFullScreen(arg === GameState.Opened);
            // Show menu bar if game is not opened
            this.browserWindow.setMenuBarVisibility(arg !== GameState.Opened);
        });
    }
}
