import { ipcMain } from "electron";
import { autoUpdater } from "electron-updater";

export const updater = () => {
  autoUpdater.on("checking-for-update", (info) =>
    ipcMain.emit("update", "checking", info)
  );

  autoUpdater.on("error", (e) => {
    ipcMain.emit("update", "error", e);
    // Make sure the app still loads if an error occurs
    ipcMain.emit("preload-finished");
    //app.quit();
  });

  autoUpdater.on("download-progress", (e) =>
    ipcMain.emit("update", "download-progress", e)
  );

  autoUpdater.on("update-available", (e) =>
    ipcMain.emit("update", "update-available", e)
  );

  autoUpdater.on("update-not-available", (info) => {
    ipcMain.emit("update", "update-not-available", info);

    // Open game window if no update available
    ipcMain.emit("preload-finished");
  });

  autoUpdater.on("update-downloaded", (info) => {
    ipcMain.emit("update", "update-downloaded", info);
    setTimeout(() => autoUpdater.quitAndInstall(), 2500);
  });

  autoUpdater.channel = "latest";
  autoUpdater.checkForUpdates();
};
