import { ipcMain, Menu } from "electron";

export const mainDropDownMenu = Menu.buildFromTemplate([
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ],
  },
  {
    label: "Game",
    submenu: [
      /*{
      label: 'Open Settings',
      click() {
          ipcMain.emit('open-settings');
      }
    },*/
      {
        label: "Toggle Auto Fullscreen",
        submenu: [
          {
            label: "On",
            click() {
              ipcMain.emit('autofullscreen', true);
            }
          },
          {
            label: "Off",
            click() {
              ipcMain.emit('autofullscreen', false);
            }
          },
        ],
      },
      {
        label: "Unlimited Framerate (Restarts Game)",
        submenu: [
          {
            label: "On",
            click() {
              ipcMain.emit('unlimitedfps', true);
            }
          },
          {
            label: "Off",
            click() {
              ipcMain.emit('unlimitedfps', false);
            }
          },
        ],
      },
      {
        label: "Vsync (restarts Game)",
        submenu: [
          {
            label: "On",
            click() {
              ipcMain.emit('vsync', true);
            }
          },
          {
            label: "Off",
            click() {
              ipcMain.emit('vsync', false);
            }
          },
        ],
      },
      {
        label: "Copy GPU Info (Clipboard)",
        click() {
          ipcMain.emit("copygpuinfo");
        },
      },
      {
        label: "Quit",
        accelerator: "CTRL+Q",
        click: (_) => ipcMain.emit("force-close-app"),
      },
    ],
  },
]);
