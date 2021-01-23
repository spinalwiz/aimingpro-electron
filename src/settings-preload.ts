import { contextBridge, ipcRenderer } from "electron";

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

        contextBridge.exposeInMainWorld("settings", {
            request: () => {
                ipcRenderer.send("settings-request");
            },
            receive: (callback: any) => {
                ipcRenderer.on("settings-response", (e, ...args) =>
                    callback(...args)
                );
            },
            onChange: (data: any) => {
                ipcRenderer.send("settings-changed", data);
            }
        });

        document.dispatchEvent(new CustomEvent("PRELOAD-READY"));
    },
    false
);
