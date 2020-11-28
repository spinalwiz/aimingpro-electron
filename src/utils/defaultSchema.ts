import { DatabaseSchema, KeybindList, SettingsList } from '../types/DataStore'

const defaultSettings : SettingsList = {
    unlimitedfps: true,
    fullscreenOnGameStart: true,
    d3d11: true,
    quic: true,
    vsync: true
}

const defaultKeybinds : KeybindList = {
    maximize: 'f11'
}

export const defaultSchema : DatabaseSchema = {
    settings: defaultSettings,
    keybinds: defaultKeybinds
};