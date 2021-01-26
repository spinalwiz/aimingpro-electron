import { app, ipcMain, Menu } from "electron";
import { osHelper } from "../utils";

export const mainDropDownMenu = Menu.buildFromTemplate([
    (osHelper === "mac") ? {
        label: app.name,
        submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" }
        ]
    } : {},
    {
        label: "View",
        submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { type: "separator" },
            { role: "togglefullscreen" }
        ]
    },
    {
        label: "Game",
        submenu: [
            { label: `App Version: ${app.getVersion()}`, enabled: false },
            { type: "separator" },
            { label: "Settings", enabled: false },
            { type: "separator" },
            {
                label: "Toggle Auto Fullscreen",
                submenu: [
                    {
                        label: "On",
                        click() {
                            ipcMain.emit("autofullscreen", true);
                        }
                    },
                    {
                        label: "Off",
                        click() {
                            ipcMain.emit("autofullscreen", false);
                        }
                    }
                ]
            },
            {
                label: "Unlimited Framerate (Restarts Game)",
                submenu: [
                    {
                        label: "On",
                        click() {
                            ipcMain.emit("unlimitedfps", true);
                        }
                    },
                    {
                        label: "Off",
                        click() {
                            ipcMain.emit("unlimitedfps", false);
                        }
                    }
                ]
            },
            {
                label: "Vsync (Restarts Game)",
                submenu: [
                    {
                        label: "On",
                        click() {
                            ipcMain.emit("vsync", true);
                        }
                    },
                    {
                        label: "Off",
                        click() {
                            ipcMain.emit("vsync", false);
                        }
                    }
                ]
            },
            { type: "separator" },
            { label: "Other", enabled: false },
            { type: "separator" },
            {
                label: "Clear Cache",
                click() {
                    ipcMain.emit("clear-cache");
                }
            },
            {
                label: "Reset Client Settings",
                click() {
                    ipcMain.emit("settings-restore");
                }
            },
            {
                label: "Copy GPU Info (Clipboard)",
                click() {
                    ipcMain.emit("copygpuinfo");
                }
            },
            {
                label: "Quit",
                accelerator: "CTRL+Q",
                click: (_) => ipcMain.emit("force-close-app")
            }
        ]
    }
]);
