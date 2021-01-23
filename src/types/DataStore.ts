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

export interface DataStore {
    readByKey(key: string): any;

    read(): DatabaseSchema;

    store(settings: DatabaseSchema): void;

    set(key: keyof DatabaseSchema, value: any): void;

    load(): void;

    save(): void;

    display(): void;
}
