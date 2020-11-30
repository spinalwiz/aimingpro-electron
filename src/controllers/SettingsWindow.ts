import { BaseWindow } from "./baseWindow";
import * as path from "path";
import { ipcMain } from "electron";
import { Settings } from "../services";
import { SettingsList } from "../types";

export class SettingsWindow extends BaseWindow {
    constructor() {
        super({
            webPreferences: {
                preload: path.join(__dirname, "../../dist/settings-preload.js"),
                contextIsolation: true,
            },
            show: false,
            frame: true,
        });
    }

    init() {
        /* Set window variables */
        this.browserWindow.loadFile(
            path.join(__dirname, "../views/settings.html")
        );
        /* Settings should self open */
        this.browserWindow.show();

        // Temporarily Open devtools | Ctrl+Shift+i
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

        ipcMain.on("settings-request", () => {
            this.browserWindow.webContents.send(
                "settings-response",
                Settings.getInstance().getSettings()
            );
        });

        ipcMain.on("settings-changed", (e, settings: SettingsList) => {
            console.log("Settings have Changed!");
            console.log(settings);
        });
    }
}
