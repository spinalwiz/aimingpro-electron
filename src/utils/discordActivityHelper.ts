import { DiscordActivity, GameStatusUpdate } from "../types";
import { ipcRenderer } from "electron";
import { parsePageFromTitle } from "./parsePageFromTitle";

export const gameActivity = (status: GameStatusUpdate) => {
    const activity: DiscordActivity = {
        title: status.gameName,
        description: String(`Current HS: ${status.highScore.toString()}`)
    };

    // Send the activity-update
    ipcRenderer.send("activity-update", activity);
};

export const browseActivity = () => {
    // Default activity if window is closed
    const activity: DiscordActivity = {
        title: "Browsing",
        description: parsePageFromTitle(document.title)
    };
    // Send the activity-update
    ipcRenderer.send("activity-update", activity);
};
