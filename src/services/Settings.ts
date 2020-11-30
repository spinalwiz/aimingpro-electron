import { DataStore, KeybindList, SettingsList, DatabaseSchema } from "../types/DataStore";
import { AimingproElectronStore } from "./AimingproElectronStore"
import { validator } from "../utils";
import { defaultSettings } from '../schemas';

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
         // If store is not initialized set it to the default schema
         if(!this.isInitialized()) this.setDefault();
         // If store is invalid repair it
         if(!this.isValid()) this.repair();
     }

     private isInitialized() : boolean{
        return (Object.keys(this.getAll()).length > 0 );
     }

     private isValid() : boolean{
        return validator.deepCompareObjects(this.getAll(), defaultSettings);
     }

     public setAll(schema : DatabaseSchema){
        this.store.store(schema);
        this.store.save();
     }

     public getAll() : DatabaseSchema{
         return this.store.read();
     }

     public getSettings() : SettingsList{
         return this.store.readByKey('settings');
     }

     public setSettings(key : keyof SettingsList, val : any){
        const temp = this.store.readByKey('settings');
        // Check if key is not undefined and the key matches the type the default schema
        if(typeof temp[key] !== 'undefined' && typeof defaultSettings.settings[key] ===  typeof temp[key]){
            temp[key] = val;
        }
        this.store.set('settings', temp);
     }

     public getKeybkinds() : KeybindList{
         return this.store.readByKey('keybinds');
     }

     private repair(){
        const fixedTemp = validator.fixDatabase(defaultSettings, this.getAll());

        // If it's valid after repair store it to database
        if(validator.deepCompareObjects(defaultSettings, fixedTemp)){
            this.setAll(fixedTemp);
        // Set to default if not valid
        } else{
            this.setDefault();
        }
     }

     public setDefault(){
        this.store.store(defaultSettings);
        this.store.save();
     }
}