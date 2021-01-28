import { ipcRenderer } from "electron";

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

        ipcRenderer.on("loadingscreen-status", (e, status: string) => {
            document.querySelector("#loading-description").textContent = status;
        });
    },
    false
);
