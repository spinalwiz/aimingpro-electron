import "v8-compile-cache";
import { app, ipcMain, shell } from "electron";
import { GameWindow, SplashWindow } from "./controllers";
import { PreloadQueue, Updater } from "./services";
import {
    APClientSettings,
    consoleLogger,
    container,
    isAMDCPU,
    protocolURIParser,
} from "./utils";
import { APDiscord, ClientSettingsAPI, ServiceTypes } from "./types/services";
import { DatabaseSchema } from "./types";
import { inject, injectable } from "inversify";

@injectable()
class AimingProApp {
    private windows: { game: GameWindow; splash: SplashWindow } = {
        game: null,
        splash: null,
    };

    constructor(
        @inject(ServiceTypes.ClientSettingsAPI)
        private _settings: ClientSettingsAPI<DatabaseSchema>
    ) {
        app.on("ready", () => {
            // This emits 'preload-finished' when all given events have fired on ipcMain which starts the GameWindows
            PreloadQueue.start(["update-finished"]);

            // initialize splash window
            this.windows.splash = new SplashWindow();

            // Check for updates
            Updater.check();

            // Set windows to use aimingpro as default protocol
            if (
                app.setAsDefaultProtocolClient(APClientSettings.PROTOCOL_PREFIX)
            )
                consoleLogger.warn("Protocol couldn't be attached");
        });

        // Open external links in user's main browser
        app.on("web-contents-created", (event, contents) => {
            function openLinkSafely(url: URL) {
                if (["https:", "http:", "mailto:"].includes(url.protocol)) {
                    shell.openExternal(url.toString());
                }
            }

            contents.on("will-navigate", (event, navigationUrl) => {
                const parsedUrl = new URL(navigationUrl);

                if (
                    !APClientSettings.ALLOWED_ORIGIN.includes(parsedUrl.origin)
                ) {
                    event.preventDefault();
                    openLinkSafely(parsedUrl);
                }
            });

            // Electron v11
            contents.on("new-window", (event, url) => {
                const parsedUrl = new URL(url);
                event.preventDefault();
                openLinkSafely(parsedUrl);
            });

            // Electron v12+
            // contents.setWindowOpenHandler(({ url }) => {
            //     openLinkSafely(new URL(url));
            //     return {
            //         action: "deny",
            //     };
            // });
        });

        this.handleSwitches();
        this.initEvents();
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
            if (isAMDCPU > -1) app.commandLine.appendSwitch("enable-zero-copy");
        }

        if (settings.vsync) {
            app.commandLine.appendSwitch("disable-gpu-vsync");
        }

        /* D3D11 Experimental Features. Mostly for CPU rendering.*/
        if (settings.d3d11) {
            /* Experimental Optimizations */
            app.commandLine.appendSwitch("use-angle", "d3d9");
            app.commandLine.appendSwitch("enable-webgl2-compute-context");
            app.commandLine.appendSwitch("renderer-process-limit", "100");
            app.commandLine.appendSwitch("max-active-webgl-contexts", "100");
        }

        // Electron v11
        // Enable unadjustedMovement (raw mouse input) for pointer lock
        app.commandLine.appendSwitch("enable-features", "PointerLockOptions");
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
                container.get<ClientSettingsAPI<DatabaseSchema>>(
                    ServiceTypes.ClientSettingsAPI
                ),
                container.get<APDiscord>(ServiceTypes.APDiscord)
            );
        }

        // Make sure the handler is only executed after the call
        this.protocolHandler(process.argv);

        // Get rid off splash screen
        this.windows.splash.destroy();
        this.windows.splash = null;
    }

    private initEvents() {
        /* if a second instance is created, focus on the game window */
        app.on("second-instance", (e, commandLine) => {
            // Someone tried to run a second instance, we should focus our window.
            if (this.windows.game) {
                // Focus on main window if second instance is attempted
                if (this.windows.game.getBrowserWindow().isMinimized())
                    this.windows.game.getBrowserWindow().restore();
                this.windows.game.getBrowserWindow().focus();
            }

            this.protocolHandler(commandLine);
        });

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
            container.unbindAll();
            app.quit();
        });

        app.on("will-quit", () => {
            container.unbindAll();
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
                if (prot && prot.action === "game")
                    this.windows.game.loadGame(+prot.parameter);
                if (prot && prot.action === "playlist")
                    this.windows.game.loadPlaylist(+prot.parameter);
            });
        } else {
            // If there are any args check if the action is game and emit the load game event
            if (prot && prot.action === "game")
                this.windows.game.loadGame(+prot.parameter);
            if (prot && prot.action === "playlist")
                this.windows.game.loadPlaylist(+prot.parameter);
        }
    }
}

const gotTheLock: boolean = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    new AimingProApp(
        container.get<ClientSettingsAPI<DatabaseSchema>>(
            ServiceTypes.ClientSettingsAPI
        )
    );
}
