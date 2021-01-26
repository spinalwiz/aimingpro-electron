/**
 * Primarily for inversify DI
 */
export const ServiceTypes = {
    ClientSettingsAPI: Symbol.for("ClientSettingsAPI"),
    DataStore: Symbol.for("Datastore"),
    APDiscord: Symbol.for("APDiscord")
};
