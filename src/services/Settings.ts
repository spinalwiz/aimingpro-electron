import { DatabaseSchema, DataStore, KeybindList, SettingsList } from "../types";
import { validator } from "../utils";
import { defaultSettings } from "../schemas";
import { app, clipboard, ipcMain } from "electron";
import { ClientSettingsAPI, ServiceTypes } from "../types/services";
import { inject, injectable } from "inversify";

@injectable()
export class Settings implements ClientSettingsAPI<DatabaseSchema> {
    public constructor(
        @inject(ServiceTypes.DataStore) private store: DataStore<DatabaseSchema>
    ) {
        this.store.load();
        // If store is not initialized set it to the default schema
        if (!this.isInitialized()) this.setDefault();
        // If store is invalid repair it
        if (!this.isValid()) this.repair();

        this.initEvents();
    }

    public setAll(schema: DatabaseSchema): void {
        this.store.store(schema);
        this.store.save();
    }

    public getAll(): DatabaseSchema {
        return this.store.read();
    }

    public getSettings(): SettingsList {
        return this.store.readByKey("settings");
    }

    public setSettings(key: keyof SettingsList, val: any): void {
        const temp = this.store.readByKey("settings");
        // Check if key is not undefined and the key matches the type the default schema
        if (
            typeof temp[key] !== "undefined" &&
            typeof defaultSettings.settings[key] === typeof temp[key]
        ) {
            temp[key] = val;
        }
        this.store.set("settings", temp);
    }

    public getKeybkinds(): KeybindList {
        return this.store.readByKey("keybinds");
    }

    public setDefault(): void {
        this.store.store(defaultSettings);
        this.store.save();
    }

    private isInitialized(): boolean {
        return Object.keys(this.getAll()).length > 0;
    }

    private isValid(): boolean {
        return validator.deepCompareObjects<DatabaseSchema>(this.getAll(), defaultSettings);
    }

    private repair() {
        const fixedTemp = validator.fixDatabase<DatabaseSchema>(defaultSettings, this.getAll());

        // If it's valid after repair store it to database
        if (validator.deepCompareObjects<DatabaseSchema>(defaultSettings, fixedTemp)) {
            this.setAll(fixedTemp);
            // Set to default if not valid
        } else {
            this.setDefault();
        }
    }

    private initEvents() {
        ipcMain.on("settings-restore", () => {
            this.setDefault();
        });

        /* Toggle auto fullscreen */
        ipcMain.on("autofullscreen", (e) => {
            this.setSettings("fullscreenOnGameStart", e);
        });

        /* Toggle unlimited fps */
        ipcMain.on("unlimitedfps", (e) => {
            this.setSettings("unlimitedfps", e);
            app.relaunch();
            app.exit();
        });

        /* Toggle vsync */
        ipcMain.on("vsync", (e) => {
            this.setSettings("vsync", e);
            app.relaunch();
            app.exit();
        });

        /* Copy GPU Info to clipboard */
        ipcMain.on("copygpuinfo", () => {
            app.getGPUInfo("complete").then((e) => {
                clipboard.writeText(JSON.stringify(e, null, 1));
            });
        });

    }
}
