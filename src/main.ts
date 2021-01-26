import "v8-compile-cache";
import { app, ipcMain } from "electron";
import { GameWindow, SplashWindow } from "./controllers";
import { PreloadQueue, Updater } from "./services";
import { APClientSettings, consoleLogger, container, protocolURIParser } from "./utils";
import { APDiscord, ClientSettingsAPI, ServiceTypes } from "./types/services";
import { DatabaseSchema } from "./types";
import { inject, injectable } from "inversify";
import * as os from "os";

@injectable()
class AimingProApp {
    private windows: { game: GameWindow, splash: SplashWindow } = { game: null, splash: null };
    private readonly gotTheLock: boolean;

    constructor(
        @inject(ServiceTypes.ClientSettingsAPI) private _settings: ClientSettingsAPI<DatabaseSchema>
    ) {
        this.gotTheLock = app.requestSingleInstanceLock();

        this.handleLock();
        this.initEvents();
        this.handleSwitches();

        /* APP INITIALIZATION
         */
        app.on("ready", () => {
            // This emits 'preload-finished' when all given events have fired on ipcMain which starts the GameWindows
            PreloadQueue.start(["update-finished"]);

            // initialize splash window
            this.windows.splash = new SplashWindow();

            // Check for updates
            Updater.start().check();

            // Set windows to use aimingpro as default protocol
            if (app.setAsDefaultProtocolClient(APClientSettings.PROTOCOL_PREFIX)) consoleLogger.warn("Protocol couldn't be attached");
        });
    }

    private handleLock() {
        if (!this.gotTheLock) {
            app.quit();
        } else {
            // Focus on app window if someone tried to open a second instance
            app.on("second-instance", (e, commandLine) => {
                // Someone tried to run a second instance, we should focus our window.
                if (this.windows.game) {
                    // Focus on main window if second instance is attempted
                    if (this.windows.game.getBrowserWindow().isMinimized()) this.windows.game.getBrowserWindow().restore();
                    this.windows.game.getBrowserWindow().focus();

                    this.protocolHandler(commandLine);
                }
            });
        }
    }

    private handleSwitches() {
        const settings = this._settings.getSettings();
        // ignore the browser blacklist (usually to support older gpus)
        app.commandLine.appendSwitch("ignore-gpu-blacklist");

        // force Dedicated GPU
        app.commandLine.appendSwitch("force_high_performance_gpu");

        // experimental fix for blurry fonts
        app.commandLine.appendSwitch("high-dpi-support", "1");

        // new http protocol
        if (settings.quic) app.commandLine.appendSwitch("enable-quic");

        /* unlimited fps switch */
        if (settings.unlimitedfps) {
            app.commandLine.appendSwitch("disable-frame-rate-limit");
            /* Improve unlimited FPS performance on AMD cpus */
            if (os.cpus()[0].model.indexOf("AMD") > -1)
                app.commandLine.appendSwitch("enable-zero-copy");
        }

        // vsync can only be off if unlimited fps are on
        if (settings.vsync && settings.unlimitedfps) {
            app.commandLine.appendArgument("--disable-gpu-vsync");
        }

        /* D3D11 Experimental Features. Mostly for CPU rendering.*/
        if (settings.d3d11) {
            /* Experimental Optimizations */
            app.commandLine.appendSwitch("use-angle", "d3d9");
            app.commandLine.appendSwitch("enable-webgl2-compute-context");
            app.commandLine.appendSwitch("renderer-process-limit", "100");
            app.commandLine.appendSwitch("max-active-webgl-contexts", "100");
        }
    }

    /**
     * Prepares the game window (triggered by 'preload-finished)
     * and clears all resources that are not needed anymore
     * @private
     */
    private startGameWindow() {
        // close the preload object
        PreloadQueue.close();
        // Clear the updater after the update is done
        Updater.close();

        /* once preload is done run game screen */
        if (this.windows.game === null) {
            this.windows.game = new GameWindow(
                this._settings,
                container.get<APDiscord>(ServiceTypes.APDiscord)
            );
        }

        // Make sure the handler is only executed after the call
        this.protocolHandler(process.argv);

        // Get rid off splash screen
        this.windows.splash.getBrowserWindow().close();
        this.windows.splash = null;
    }

    private initEvents() {
        /* once all elements in splash screen are loaded open game screen and close splash screen */
        ipcMain.once("preload-finished", () => {
            this.startGameWindow();
        });

        app.on("open-url", (event, args) => {
            event.preventDefault();
            this.protocolHandler(Array(args));
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
            app.quit();
        });
    }

    /**
     * Handles the protocol
     * @param arg
     * @private
     */
    private protocolHandler(arg: string[]): void {
        const prot = protocolURIParser(arg);

        // if the game hasn't loaded yet, wait for the event
        if (this.windows.game == null) {
            ipcMain.once("gamewindow-ready", () => {
                // If there are any args check if the action is game and emit the load game event
                if (prot && prot.action === "game") this.windows.game.loadGame(+prot.parameter);
                if (prot && prot.action === "playlist") this.windows.game.loadPlaylist(+prot.parameter);
            });
        } else {
            // If there are any args check if the action is game and emit the load game event
            if (prot && prot.action === "game") this.windows.game.loadGame(+prot.parameter);
            if (prot && prot.action === "playlist") this.windows.game.loadPlaylist(+prot.parameter);
        }
    }
}

const aimingProApp = new AimingProApp(
    /* dependencies */
    container.get<ClientSettingsAPI<DatabaseSchema>>(ServiceTypes.ClientSettingsAPI)
);
export default aimingProApp;
