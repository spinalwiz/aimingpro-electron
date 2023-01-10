import { AutoUpdater, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import * as isDev from "electron-is-dev";

export class Updater {
    public static close(): void {
        autoUpdater.removeAllListeners();
    }

    public static check(): void {
        // If on dev don't update
        if (isDev) {
            ipcMain.emit("update-finished");
            return;
        }

        this.attachEventListeners();

        autoUpdater.checkForUpdates().catch((e) => {
            // tslint:disable-next-line: no-console
            console.error(`An error has occured in the updater: ${e}`);
            ipcMain.emit("update-finished");
        });
    }

    private static attachEventListeners() {
        // Checking for updates
        autoUpdater.on("checking-for-update", () => {
            ipcMain.emit("loadingscreen-status", "Checking for Updates...");
        });

        // Show error message and load old app
        autoUpdater.on("error", (err: Error) => {
            console.log(err);
            ipcMain.emit("loadingscreen-status", "An Error has Occured!");
            setTimeout(() => ipcMain.emit("update-finished"), 2500);
        });

        // download progress update
        autoUpdater.on("download-progress", (e) => {
            const percent = (e.percent as number).toFixed(0);
            ipcMain.emit("loadingscreen-status", `Download at ${percent}%`);
        });

        // update is available
        autoUpdater.on("update-available", () => {
            ipcMain.emit("loadingscreen-status", "Updates Available...");
        });

        // no update available
        autoUpdater.on("update-not-available", () => {
            ipcMain.emit("loadingscreen-status", "No Updates Available...");
            setTimeout(() => ipcMain.emit("update-finished"), 1000);
        });

        // downloaded
        autoUpdater.on("update-downloaded", () => {
            ipcMain.emit("loadingscreen-status", "Preparing Installation...");
            setTimeout(() => autoUpdater.quitAndInstall(), 2500);
        });
    }
}
