import { ipcMain } from "electron";
import { autoUpdater } from "electron-updater";

export class Updater{
    public constructor(){
        this.attachEventListeners();
    }

    check(){
      autoUpdater.checkForUpdates().catch((e) => {
        // tslint:disable-next-line: no-console
        console.error(`An error has occured in the updater: ${e}`);
        ipcMain.emit('preload-finished');
      });
    };

    private attachEventListeners(){
            // Checking for updates
    autoUpdater.on("checking-for-update", (info) => {
        ipcMain.emit('update-status',"Checking for Updates...");
    });

      // Show error message and load old app
      autoUpdater.on("error", (e) => {
        ipcMain.emit('update-status', "An Error has Occured!")
        setTimeout(() => ipcMain.emit("preload-finished"), 2500);
      });

      // download progress update
      autoUpdater.on("download-progress", (e) => {
        const percent = (e.percent as number).toFixed(2);
        ipcMain.emit('update-status', `Download at ${percent}%`);
      });

      // update is available
      autoUpdater.on("update-available", (e) => {
        ipcMain.emit('update-status',"Updates Available...");
      });

      // no update available
      autoUpdater.on("update-not-available", (info) => {
        ipcMain.emit('update-status', "No Updates Available...");
        setTimeout(() => ipcMain.emit("preload-finished"), 1000);
      });

      // downloaded
      autoUpdater.on("update-downloaded", (info) => {
        ipcMain.emit('update-status',"Preparing Installation...");
          setTimeout(() => autoUpdater.quitAndInstall(), 2500);
      });
    }
}