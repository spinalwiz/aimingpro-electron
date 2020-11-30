import { constant } from "../utils/constant";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import * as path from "path";

export abstract class BaseWindow {
    public browserWindow: BrowserWindow;

    constructor(wOptions?: BrowserWindowConstructorOptions) {
        const defaultWOptions: BrowserWindowConstructorOptions = {
            /* Hide windows by default */
            show: false,
            titleBarStyle: "hidden",
            webPreferences: {
                preload: path.join(__dirname, "../../dist/preload.js"),
            },
        };

        /* use default options if none are provided */
        this.browserWindow = new BrowserWindow(
            wOptions ? wOptions : defaultWOptions
        );
        /* Set default custom user agent */
        this.browserWindow.webContents.setUserAgent(
            this.browserWindow.webContents.getUserAgent() +
                constant.userAgentSuffix
        );

        this.init();

        // Make sure window is destroyed when closed (NOT MINIMZED).
        // Still needs nullifying reference to this object.
        this.browserWindow.on("close", (e) => {
            this.browserWindow.destroy();
        });

        // Gracefully show windows
        this.browserWindow.on("ready-to-show", () => {
            this.browserWindow.show();
        });
    }

    /* make sure each window has to implement their own init() method */
    abstract init(): void;
}
