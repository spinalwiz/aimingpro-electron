import { app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain, Menu, session, shell } from "electron";
import * as path from "path";
import { mainDropDownMenu } from "../schemas";
import { APClientSettings, consoleLogger, osHelper } from "../utils";
import { APBrowserWindow, DatabaseSchema, DiscordActivity, GameState, OSType } from "../types";
import { inject, injectable } from "inversify";
import { APDiscord, ClientSettingsAPI, ServiceTypes } from "../types/services";

@injectable()
export class GameWindow implements APBrowserWindow {
    private readonly browserWindow: BrowserWindow;

    constructor(
        @inject(ServiceTypes.ClientSettingsAPI) private _settings: ClientSettingsAPI<DatabaseSchema>,
        @inject(ServiceTypes.APDiscord) private _discord: APDiscord
    ) {
        const browserOptions: BrowserWindowConstructorOptions = {
            /* Hide windows by default */
            show: false,
            frame: false,
            width: 941,
            height: 800,
            fullscreen: true,
            titleBarStyle: "default",
            webPreferences: {
                preload: path.join(__dirname, "../../dist/game-preload.js"),
                contextIsolation: false,
                nodeIntegration: false,
            }
        };

        if (this.browserWindow == null) this.browserWindow = new BrowserWindow(browserOptions);

        this.init();
        // Make sure window is destroyed when closed (NOT MINIMZED).
        // Still needs nullifying reference to this object.
        this.browserWindow.on("close", () => {
            this.browserWindow.destroy();
        });

        // Gracefully show windows
        this.browserWindow.on("ready-to-show", () => {
            ipcMain.emit("gamewindow-ready");
            this.browserWindow.show();
        });
    }

    init(): void {
        this.browserWindow.webContents.setUserAgent(
            this.browserWindow.webContents.getUserAgent() +
                APClientSettings.userAgentSuffix
        );

        console.log(this.browserWindow.webContents.getUserAgent());

        this.browserWindow.loadURL(APClientSettings.baseUrl).catch(consoleLogger.critical);

        // load maximzed
        this.browserWindow.maximize();

        this.initMenu();
        this.initShortcuts();
        this.initEvents();
    }

    // Check if user is logged in by looking for specific cookies
    async isLoggedIn(): Promise<boolean> {
        const cookies = await session.defaultSession.cookies.get({
            url: APClientSettings.baseUrl
        });

        for (const i in cookies) {
            if (cookies[i].name.startsWith("remember_web_") === true)
                return true;
        }

        return false;
    }

    loadGame(gameId: number): void {
        if (isNaN(gameId)) return;
        this.isLoggedIn().then((e) => {
            // if not logged in redirect to login page | Else load the game
            const href = e
                ? APClientSettings.gameBaseUrl + gameId
                : APClientSettings.baseUrl + "login";
            this.browserWindow.loadURL(href).catch(consoleLogger.critical);
        });
    }

    loadPlaylist(playlistID: number): void {
        if (isNaN(playlistID)) return;
        this.isLoggedIn().then((e) => {
            // if not logged in redirect to login page
            const href = e ? APClientSettings.baseUrl + "#/training/playlists/play/" + playlistID : APClientSettings.baseUrl + "login";
            this.browserWindow.loadURL(href).catch(consoleLogger.warn);
        });
    }

    getBrowserWindow(): Electron.BrowserWindow {
        return this.browserWindow;
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
            }
        );
    }

    // Setup Event Handlers
    private initEvents(): void {
        // If the game window is closed simulate window-all-closed
        this.browserWindow.on("close", () => {
            this._discord.clear();
            app.quit();
        });

        this.browserWindow.webContents.on("new-window", (e, url) => {
            e.preventDefault();
            shell.openExternal(url);
        });

        ipcMain.on("clear-cache", () => {
            this.browserWindow.webContents.session.clearCache().catch(() => {
                consoleLogger.warn("Could not clear cache");
            });
            this.browserWindow.webContents.session.clearStorageData().catch(() => {
                consoleLogger.warn("Could not clear storage data");
            });

            this.browserWindow.webContents.reload();
        });

        /* automatic fullscreen on game screen | Also hide menu bars automatically */
        ipcMain.on("gamewindow", (e, arg: GameState) => {
            const settings = this._settings.getSettings();
            // Fullscreen on gamestart if enabled
            if (settings.fullscreenOnGameStart)
                this.browserWindow.setFullScreen(arg === GameState.Opened);
            // Show menu bar if game is not opened
            this.browserWindow.setMenuBarVisibility(arg !== GameState.Opened);
        });

        ipcMain.on("activity-update", (e, arg: DiscordActivity) => {
            this._discord.updateActivity(arg);
        });
    }

    private initMenu(): void {
        // Mac needs a different kind of menu
        if (osHelper === OSType.MAC) {
            Menu.setApplicationMenu(mainDropDownMenu);
        } else {
            this.browserWindow.setMenu(mainDropDownMenu);
        }
    }
}
