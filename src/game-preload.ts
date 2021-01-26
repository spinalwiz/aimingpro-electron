import { ipcRenderer } from "electron";
import { GameState, GameStatusUpdate } from "./types";
import { modalPointerlockFix, pointerLockFix } from "./utils/pointerlockHelper";
import { browseActivity, gameActivity} from "./utils/discordActivityHelper";

window.addEventListener(
    "DOMContentLoaded",
    () => {

        // IF GAME PAGE
        if (typeof (window as any).gameVue === "object") {
            pointerLockFix(document);
            ipcRenderer.send("gamewindow", GameState.Opened);
        } else {
            // let the controller know and update activity
            browseActivity();
            ipcRenderer.send("gamewindow", GameState.Closed);
        }

        /* Wait for Game Events to send to the RPC */
        window.addEventListener(
            "game-status-update",
            (e: CustomEvent<GameStatusUpdate>) => {
                // Prepare the discord template
                gameActivity(e.detail);
            }
        );

        window.addEventListener("game-modal-closed", () => {
            browseActivity();
            ipcRenderer.send("gamewindow", GameState.Closed);
        });

        // If a game has started
        window.addEventListener("project-started", () => {
            // We don't want to use the regular injection if it's a modal
            if (typeof (window as any).gameVue !== "object"){
                // Let the controller now that a game has been opened
                ipcRenderer.send("gamewindow", GameState.Opened);

                let tries = 0;
                const injection = setInterval(() => {
                    if (tries > 4 || modalPointerlockFix(document)) clearInterval(injection);
                    tries++;
                }, 200);
            }
        });
    },
    false
);
