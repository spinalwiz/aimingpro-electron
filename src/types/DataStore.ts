export interface SettingsList {
    unlimitedfps: boolean;
    fullscreenOnGameStart: boolean;
    d3d11: boolean;
    quic: boolean;
    vsync: boolean;
}

export interface KeybindList {
    maximize: string;
}

export interface DatabaseSchema {
    settings: SettingsList;
    keybinds: KeybindList;
}

export interface DataStore<T> {
    readByKey(key: string): any;

    read(): T;

    store(settings: T): void;

    set(category: keyof T, property?: string, value?: any): void;

    load(): void;

    save(): void;

    display(): void;
}
