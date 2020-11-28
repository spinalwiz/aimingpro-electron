import { DataStore, KeybindList, SettingsList, DatabaseSchema } from "../types/DataStore";
import { AimingproElectronStore } from "./AimingproElectronStore"
import { defaultSchema } from "../utils/defaultSchema";

export class Settings{
    private store : DataStore;
    private shouldUseElectron = true;
    private static instance : Settings;

    public static getInstance(){
        if(!Settings.instance){
            this.instance = new Settings();
        }

        return this.instance;
    }

    private constructor(){
         // For future purposes we might want other stores
         if(this.shouldUseElectron) this.store = new AimingproElectronStore();
         this.store.load();
         if(!this.store.isInitialized()) this.setDefaultSchema();
     }

     public getSettings() : SettingsList{
         return this.store.read('settings');
     }

     public setSettings(key : keyof SettingsList, val : any){
         const temp = this.store.read('settings');
         if(key in temp){
            temp[key] = val;
            this.store.set('settings', temp);
         }
     }

     public getKeybkinds() : KeybindList{
         return this.store.read('keybinds');
     }

     public setDefaultSchema(){
        this.store.store(defaultSchema);
        this.store.save();
     }
}