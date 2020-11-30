import { ipcRenderer } from "electron";
import { DiscordActivity, GameState, GameStatusUpdate } from "./types";
import { parsePageFromTitle } from "./utils";

const gameActivity = (status: GameStatusUpdate) => {
    const activity: DiscordActivity = {
        title: status.gameName,
        description: String(`Current HS: ${status.highScore.toString()}`),
    };

    // Send the activity-update
    ipcRenderer.send("activity-update", activity);
};

const browseActivity = () => {
    // Default activity if window is closed
    const activity: DiscordActivity = {
        title: "Browsing",
        description: parsePageFromTitle(document.title),
    };
    // Send the activity-update
    ipcRenderer.send("activity-update", activity);
};

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener(
    "DOMContentLoaded",
    () => {
        // returns true if the current window contains the gameVue object (game screen)
        const gameState: GameState =
            typeof (window as any).gameVue === "object"
                ? GameState.Opened
                : GameState.Closed;

        // Send event if the game window is opened
        ipcRenderer.send("gamewindow", gameState);

        // If game is close on page load show browseActivity
        if (gameState === GameState.Closed) browseActivity();

        /* Wait for Game Events RPC if game is opened */
        window.addEventListener(
            "game-status-update",
            (e: CustomEvent<GameStatusUpdate>) => {
                // Prepare the discord template
                gameActivity(e.detail);
            }
        );

        // Auto fullscreen on iFrame as well
        window.addEventListener("game-modal-closed", () => {
            browseActivity();
            ipcRenderer.send("gamewindow", GameState.Closed);
        });

        // Pointerlock fix
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
        }

        // iFrame
        window.addEventListener("project-started", () => {
            // Let the controller now that a game has been opened
            ipcRenderer.send("gamewindow", GameState.Opened);

            // Pointer lock fix
            const selector = "#game-container";
            if (document.querySelector(selector) !== null) {
                const el = document.querySelector(
                    selector
                ) as HTMLIFrameElement;

                el.contentDocument.addEventListener("keydown", (e) => {
                    if (e.key === "Escape") {
                        const elEvent = document.querySelector(
                            selector
                        ) as HTMLIFrameElement;
                        if (elEvent.contentDocument.pointerLockElement) {
                            elEvent.contentDocument.exitPointerLock();
                            e.stopPropagation();
                        }
                    }
                });
            }
        });
    },
    false
);
