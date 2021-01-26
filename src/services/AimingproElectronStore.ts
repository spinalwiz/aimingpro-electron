import { DatabaseSchema, DataStore } from "../types";

/* SettingsList */
import * as ElectronStore from "electron-store";
import { injectable } from "inversify";

@injectable()
export class AimingproElectronStore implements DataStore<DatabaseSchema> {
    private electronStore: ElectronStore;
    private schema: DatabaseSchema;

    constructor() {
        this.electronStore = new ElectronStore();
    }

    store(settings: DatabaseSchema): void {
        this.schema = settings;
        this.save();
    }

    readByKey(key: string): any {
        return this.schema[key as keyof DatabaseSchema];
    }

    read(): DatabaseSchema {
        return this.schema;
    }

    set(key: keyof DatabaseSchema, value: any): void {
        this.schema[key] = value;
        this.save();
    }

    load(): void {
        this.schema = this.electronStore.store as any;
    }

    /* debugging purposes */
    public display(): void {
        console.log(this.schema);
    }

    save(): void {
        // another quick hack
        this.electronStore.clear();
        this.electronStore.store = this.schema as any;
        this.load();
    }
}
