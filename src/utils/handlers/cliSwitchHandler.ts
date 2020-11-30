import { SettingsList } from "../../types";
import { app } from "electron";
import * as os from "os";
/**
 * Handles the CLI Switches.
 * Needs to be called before the windows are opened!
 * @param {SettingsList} SettingsList A list with the settings
 */
export const cliSwitchHandler = (settings: SettingsList): void => {
    // ignore the browser blacklist (usually to support older gpus)
    app.commandLine.appendSwitch("ignore-gpu-blacklist");

    // force Dedicated GPU
    app.commandLine.appendSwitch("force_high_performance_gpu");
    // force rendering even if not focused
    app.commandLine.appendSwitch("disable-renderer-backgrounding");

    // experimental fix for blurry fonts
    app.commandLine.appendSwitch("high-dpi-support", "1");

    // new http protocol
    if (settings.quic) app.commandLine.appendSwitch("enable-quic");

    /* unlimited fps switch */
    if (settings.unlimitedfps) {
        app.commandLine.appendSwitch("disable-frame-rate-limit");
        /* Improve unlimited FPS performance on AMD cpus */
        if (os.cpus()[0].model.indexOf("AMD") > -1)
            app.commandLine.appendSwitch("enable-zero-copy");
    }

    // vsync can only be off if unlimited fps are on
    if (!settings.vsync && settings.unlimitedfps) {
        app.commandLine.appendArgument("--disable-gpu-vsync");
    }

    /* D3D11 Experimental Features. Mostly for CPU rendering.*/
    if (!settings.d3d11) {
        /* Experimental Optimizations */
        app.commandLine.appendSwitch("use-angle", "d3d9");
        app.commandLine.appendSwitch("enable-webgl2-compute-context");
        app.commandLine.appendSwitch("renderer-process-limit", "100");
        app.commandLine.appendSwitch("max-active-webgl-contexts", "100");
    }
};
