import { BaseWindow } from "./baseWindow"
import * as path from 'path';

export class SettingsWindow extends BaseWindow{
    init(){
        /* Set window variables */
        this.browserWindow.loadFile(path.join(__dirname, '../views/settings.html'));
        /* Settings should self open */
        this.browserWindow.show();
    }
}