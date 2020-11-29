import * as RPC from "discord-rpc";
import { ipcMain } from "electron";
import { DiscordActivity } from "../types";
import { constant } from "../utils";

export class DiscordRPC {
  private rpc: RPC.Client;
  private static instance: DiscordRPC;

  public static getInstance() {
    if (!DiscordRPC.instance) {
      this.instance = new DiscordRPC();
    }

    return this.instance;
  }

  updateActivity(activity: DiscordActivity) : void {
    this.rpc.setActivity({
      details: activity.title,
      state: activity.description,
      largeImageText: "Aiming.Pro",
      largeImageKey: constant.DISCORD_BIGPICID,
      smallImageText: "Aiming.Pro"
    });
  }

  private constructor() {
    this.rpc = new RPC.Client({ transport: "ipc" });

    this.init();
  }

  public clear() : void {
    this.rpc.clearActivity();
  }

  private init() {
    this.rpc.on("ready", () => {
      // Only attach listeners once user is logged in
      this.attachEventListeners();
    });

    // Login (ready event is fired after this)
    this.rpc.login({
      clientId: constant.DISCORD_CLIENTID
    });
  }

  private attachEventListeners() {
    /* Initialize activity updater */
    ipcMain.on("activity-update", (e, arg: DiscordActivity) => {
      this.updateActivity(arg);
    });
  }
}
