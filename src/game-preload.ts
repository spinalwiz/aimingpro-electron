import { ipcRenderer } from "electron";
import { DiscordActivity, GameState, GameStatusUpdate } from "./types";
import { parsePageFromTitle } from "./utils";


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }
    };

    for (const type of ["chrome", "node", "electron"]) {
        replaceText(`${type}-version`, (process.versions as any)[type]);
    }

    console.log("GAME PRELOAD!!");
});


const gameActivity = (status: GameStatusUpdate) => {
    const activity: DiscordActivity = {
        title: status.gameName,
        description: String(`Current HS: ${status.highScore.toString()}`)
    };

    // Send the activity-update
    ipcRenderer.send("activity-update", activity);
};

const browseActivity = () => {
    // Default activity if window is closed
    const activity: DiscordActivity = {
        title: "Browsing",
        description: parsePageFromTitle(document.title)
    };
    // Send the activity-update
    ipcRenderer.send("activity-update", activity);
};


window.addEventListener(
    "DOMContentLoaded",
    () => {

        // IF GAME PAGE
        if (typeof (window as any).gameVue === "object") {
            // Pointer lock fix
            document.body.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    if (document.pointerLockElement) {
                        document.exitPointerLock();
                        e.stopPropagation();
                    }
                }
            });
            // IF NOT GAME PAGE
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

        ipcRenderer.addListener("notify-user", (...args) => {
            console.log(args);
        });

        // If a game has started
        window.addEventListener("project-started", () => {
            // Let the controller now that a game has been opened
            ipcRenderer.send("gamewindow", GameState.Opened);

            // If game has started as a MODAL
            const selector = "#game-container";
            if (document.querySelector(selector) !== null) {
                const el = document.querySelector(
                    selector
                ) as HTMLIFrameElement;

                // Pointerlock fix
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
