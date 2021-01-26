import * as RPC from "discord-rpc";
import { DiscordActivity } from "../types";
import { APDiscord } from "../types/services";
import { APClientSettings, consoleLogger } from "../utils";
import { injectable } from "inversify";

@injectable()
export class DiscordRPC implements APDiscord {
    private rpc: RPC.Client;
    private connected: boolean;

    public constructor() {
        this.connected = false;

        try {
            this.rpc = new RPC.Client({ transport: "ipc" });
        } catch (e) {
            consoleLogger.log(e);
        }

        this.init();
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
            this.connected = true;
            consoleLogger.log("DiscordRPC is connected");
        });

        // Login (ready event is fired after this)
        this.rpc.login({
            clientId: APClientSettings.DISCORD_CLIENTID
        }).catch(consoleLogger.warn);
    }
}
