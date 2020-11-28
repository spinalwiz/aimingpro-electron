export interface SettingsList {
    unlimitedfps: boolean,
    fullscreenOnGameStart: boolean,
    d3d11: boolean,
    quic: boolean,
    vsync: boolean
}

export interface KeybindList {
    maximize: string
}

export interface DatabaseSchema {
    settings: SettingsList;
    keybinds: KeybindList;
}

export interface DataStore {
    store(settings: DatabaseSchema): void;
    read(key: string): any;
    set(key: keyof DatabaseSchema, value: any) : void;
    isInitialized() : boolean;

    load(): void;
    save(): void;
    display(): void;
}