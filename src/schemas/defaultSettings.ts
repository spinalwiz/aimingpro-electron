import { DatabaseSchema } from '../types/DataStore'

export const defaultSettings : DatabaseSchema = {
    settings: {
        unlimitedfps: false,
        fullscreenOnGameStart: true,
        d3d11: true,
        quic: true,
        vsync: false
    },
    keybinds: {
        maximize: 'f11'
    }
};