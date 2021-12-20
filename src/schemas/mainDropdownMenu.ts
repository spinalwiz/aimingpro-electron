import { app, ipcMain, Menu } from "electron";
import { osHelper } from "../utils";
import { OSType } from "../types";
import { SettingsList } from "../types/DataStore";

export const createMainDropDownMenu = (settings: SettingsList): Electron.Menu =>
    Menu.buildFromTemplate([
        osHelper === OSType.MAC
            ? {
                  label: app.name,
                  submenu: [
                      { role: "about" },
                      { type: "separator" },
                      { role: "services" },
                      { type: "separator" },
                      { role: "hide" },
                      { role: "unhide" },
                      { type: "separator" },
                      { role: "quit" },
                  ],
              }
            : { role: null },
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { role: "selectAll" },
            ],
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { type: "separator" },
                { role: "togglefullscreen" },
            ],
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
                            type: "radio",
                            checked: settings.fullscreenOnGameStart,
                            click(menuItem) {
                                ipcMain.emit("autofullscreen", true);
                                menuItem.checked = !menuItem.checked;
                            },
                        },
                        {
                            label: "Off",
                            type: "radio",
                            checked: !settings.fullscreenOnGameStart,
                            click(menuItem) {
                                ipcMain.emit("autofullscreen", false);
                                menuItem.checked = !menuItem.checked;
                            },
                        },
                    ],
                },
                {
                    label: "Unlimited Framerate (Restarts Game)",
                    submenu: [
                        {
                            label: "On",
                            type: "radio",
                            checked: settings.unlimitedfps,
                            click() {
                                ipcMain.emit("unlimitedfps", true);
                            },
                        },
                        {
                            label: "Off",
                            type: "radio",
                            checked: !settings.unlimitedfps,
                            click() {
                                ipcMain.emit("unlimitedfps", false);
                            },
                        },
                    ],
                },
                {
                    label: "Vsync (Restarts Game)",
                    submenu: [
                        {
                            label: "On",
                            type: "radio",
                            checked: !settings.vsync,
                            click() {
                                ipcMain.emit("vsync", false);
                            },
                        },
                        {
                            label: "Off",
                            type: "radio",
                            checked: settings.vsync,
                            click() {
                                ipcMain.emit("vsync", true);
                            },
                        },
                    ],
                },
                { type: "separator" },
                { label: "Other", enabled: false },
                { type: "separator" },
                {
                    label: "Clear Cache",
                    click() {
                        ipcMain.emit("clear-cache");
                    },
                },
                {
                    label: "Reset Client Settings",
                    click() {
                        ipcMain.emit("settings-restore");
                    },
                },
                {
                    label: "Copy GPU Info (Clipboard)",
                    click() {
                        ipcMain.emit("copygpuinfo");
                    },
                },
                {
                    label: "Quit",
                    accelerator: "CTRL+Q",
                    click: () => ipcMain.emit("force-close-app"),
                },
            ],
        },
    ]);
