import { KeybindList, SettingsList } from "../DataStore";
import { DiscordActivity } from "../DiscordActivity";

export interface ClientSettingsAPI<T> {
    setAll(schema: T): void

    getAll(): T

    getSettings(): SettingsList

    setSettings(key: keyof SettingsList, val: any): void

    getKeybkinds(): KeybindList

    setDefault(): void
}

export interface DataStore<T> {
    readByKey(key: string): any;

    read(): T;

    store(settings: T): void;

    set(key: keyof T, value: any): void;

    load(): void;

    save(): void;

    display(): void;
}

export interface APDiscord {
    updateActivity(activity: DiscordActivity): void;

    clear(): void;
}
