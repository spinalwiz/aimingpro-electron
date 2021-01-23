import * as RPC from "discord-rpc";
import { ipcMain } from "electron";
import { DiscordActivity } from "../types";
import { APClientSettings, consoleLogger } from "../utils";

export class DiscordRPC {
    private static instance: DiscordRPC;
    private rpc: RPC.Client;
    private connected: boolean;

    private constructor() {
        this.connected = false;

        try {
            this.rpc = new RPC.Client({ transport: "ipc" });
        } catch (e) {
            consoleLogger.log(e);
        }

        this.init();
    }

    public static getInstance() {
        if (!DiscordRPC.instance) {
            this.instance = new DiscordRPC();
        }

        return this.instance;
    }

    updateActivity(activity: DiscordActivity): void {
        this.rpc.setActivity({
            details: activity.title,
            state: activity.description,
            largeImageText: "Aiming.Pro",
            largeImageKey: APClientSettings.DISCORD_BIGPICID,
            smallImageText: "Aiming.Pro"
        }).catch(consoleLogger.warn);
    }

    public clear(): void {
        if (this.connected) this.rpc.clearActivity().catch(consoleLogger.log);
    }

    private init() {
        this.rpc.on("ready", () => {
            // Only attach listeners once user is logged in
            this.attachEventListeners();
            this.connected = true;
        });

        // Login (ready event is fired after this)
        this.rpc.login({
            clientId: APClientSettings.DISCORD_CLIENTID
        }).catch(consoleLogger.warn);
    }

    private attachEventListeners() {
        /* Initialize activity updater */
        ipcMain.on("activity-update", (e, arg: DiscordActivity) => {
            if (this.connected) this.updateActivity(arg);
        });
    }
}
