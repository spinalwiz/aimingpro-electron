import { DataStore, DatabaseSchema } from "../types/DataStore";

/* SettingsList */
import * as ElectronStore from 'electron-store';

export class AimingproElectronStore implements DataStore{
    private electronStore : ElectronStore;
    private schema : DatabaseSchema;

    constructor(){
        this.electronStore = new ElectronStore();
    }

    store(settings : DatabaseSchema): void {
        this.schema = settings;
        this.save();
    }

    read(key: string): any {
        return this.schema[key as keyof DatabaseSchema];
    }

    set(key: keyof DatabaseSchema, value: any) : void {
        /* needs better checking */
        if(key in this.schema){
            this.schema[key] = value;
            this.save();
        }
    }

    load(): void {
        // quick hack (FIX)
        const temp = {};
        Object.assign(temp, this.electronStore.store);
        this.schema = temp as DatabaseSchema;
    }

    isInitialized(){
        // Needs better checking
        if(Object.keys(this.electronStore.store).length === 0) return false;
        return true;
    }

    /* debugging purposes */
    public display(){
        console.log(this.schema);
    }

    save(): void {
        // another quick hack
        this.electronStore.clear();
        this.electronStore.store = this.schema as any;
        this.load();
    }
}