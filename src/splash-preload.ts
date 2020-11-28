import { ipcRenderer } from 'electron';
import { autoUpdater } from 'electron-updater';

const updateLoadingDescription = (d : string) => {
    document.querySelector("#loading-description").textContent = d;
}

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

  ipcRenderer.on('update-status', (e, status : string) => {
    updateLoadingDescription(status);
  })

}, false);