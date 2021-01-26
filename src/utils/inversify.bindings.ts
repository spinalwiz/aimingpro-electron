import { Container } from "inversify";
import "reflect-metadata";
// interfaces
import { APDiscord, ClientSettingsAPI, DataStore } from "../types/services";
// symbols
import { ServiceTypes } from "../types/services";
// services
import { AimingproElectronStore, DiscordRPC, Settings } from "../services";
import { DatabaseSchema } from "../types";

export const container = new Container();

/**
 * Container bindings
 */
container.bind<DataStore<DatabaseSchema>>(ServiceTypes.DataStore).to(AimingproElectronStore).inSingletonScope();
container.bind<ClientSettingsAPI<DatabaseSchema>>(ServiceTypes.ClientSettingsAPI).to(Settings);
container.bind<APDiscord>(ServiceTypes.APDiscord).to(DiscordRPC).inSingletonScope();
