import { ipcRenderer } from "electron";
import { IFrameGameUpdate, GameStatusUpdate } from "./types/events";
import { DiscordActivity, GameState } from "./types";
import { parsePageFromTitle } from "./utils/parsePageFromTitle";
import { constant } from "./utils/constant";

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener(
    "DOMContentLoaded",
    () => {
        const replaceText = (selector: string, text: string) => {
            const element = document.getElementById(selector);
            if (element) {
                element.innerText = text;
            }
        };

        for (const type of ["chrome", "node", "electron"]) {
            replaceText(`${type}-version`, (process.versions as any)[type]);
        }

        // returns true if the current window contains the gameVue object (game screen)
        const gameState: GameState =
            typeof (window as any).gameVue === "object"
                ? GameState.Opened
                : GameState.Closed;

        // Send event if the game window is opened
        ipcRenderer.send("gamewindow", gameState);

        if (gameState === GameState.Opened) {
            /* Release pointer lock on key press */
            document.body.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    if (document.pointerLockElement) {
                        document.exitPointerLock();
                        e.stopPropagation();
                    }
                }
            });

            /* Wait for Game Events RPC if game is opened */
            window.addEventListener(
                "game-status-update",
                (e: CustomEvent<GameStatusUpdate>) => {
                    // Prepare the discord template
                    const activity: DiscordActivity = {
                        title: e.detail.gameName,
                        description: String(
                            `Current HS: ${e.detail.highScore.toString()}`
                        )
                    };

                    // Send the activity-update
                    ipcRenderer.send("activity-update", activity);
                }
            );
        }

        if (gameState === GameState.Closed) {
            // Default activity if window is closed

            const activity: DiscordActivity = {
                title: "Browsing",
                description: parsePageFromTitle(document.title)
            };

            // Send the activity-update
            ipcRenderer.send("activity-update", activity);
        }

        // Send a local event game-iframe-opened with the gameId upon the external event show-game-iframe
        window.addEventListener(
            "show-game-iframe",
            (e: CustomEvent<IFrameGameUpdate>) => {
                ipcRenderer.send("game-iframe-opened", e.detail.gameId);
            }
        );
    },
    false
);
