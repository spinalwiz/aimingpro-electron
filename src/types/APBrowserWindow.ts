import { BrowserWindow } from "electron";

export interface APBrowserWindow {
    init(): void;

    getBrowserWindow(): BrowserWindow;
}
