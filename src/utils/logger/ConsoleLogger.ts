/**
 * Mostly here to avoid any TS-Lint annoyance and to easily get rid of logging
 */
import { APClientSettings } from "../APClientSettings";

export const consoleLogger = {

    /**
     * Logs the message. Mostly used for informative debugging
     * @param msg
     */
    log(...msg: any): void {
        // tslint:disable-next-line:no-console
        if (APClientSettings.LOG_LEVEL >= 1) console.log("Log: ", msg);
    },

    /**
     * Warns the user. For non-critical failures.
     * @param msg
     */
    warn(...msg: any): void {
        // tslint:disable-next-line:no-console
        if (APClientSettings.LOG_LEVEL >= 2) console.warn("\x1b[33mWarn: ", msg, "\x1b[0m");
    },

    /**
     * Logs critical failures
     * @param msg
     */
    critical(...msg: any): void {
        // tslint:disable-next-line:no-console
        if (APClientSettings.LOG_LEVEL >= 3) console.error("\x1b[31mCritical:", msg, "\x1b[0m");
    }
};
