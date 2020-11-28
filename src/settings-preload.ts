import { ipcRenderer } from 'electron';
import { Settings } from './services';

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
}, false);

window.addEventListener('get-settings', (e) => {
    const settings = Settings.getInstance().getSettings() as any;
    dispatchEvent(new CustomEvent('return-settings', settings));
});