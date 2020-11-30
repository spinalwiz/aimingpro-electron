import { ipcMain } from "electron";
import * as isDev from "electron-is-dev";

// Only required locally
type LoadingQueueType = { eventName: string; loaded: boolean };

/**
 * PreloadQueue emits 'preload-finished' on ipcMain once all events have finished loading.
 */
export class PreloadQueue {
    private loadingqueue: LoadingQueueType[] = [];
    private static instance: PreloadQueue;

    /**
     * PreloadQueue emits 'preload-finished' on ipcMain once all events have finished loading.
     * @param {String[]} eventNames Takes a list of event names
     */
    public static start(eventNames: string[]): PreloadQueue {
        if (!PreloadQueue.instance) {
            this.instance = new PreloadQueue(eventNames);
        }

        return this.instance;
    }

    public static close(): void {
        if (PreloadQueue.instance) {
            this.instance = null;
        }
    }

    private constructor(eventNames: string[]) {
        eventNames.forEach((e) => {
            // Prepare object so it can be passed by reference
            const lqItem: LoadingQueueType = {
                eventName: e,
                loaded: false,
            };

            // push item onto loadingqueue
            this.loadingqueue.push(lqItem);

            // Onc event is loaded pass its object to loaded
            ipcMain.once(e, () => {
                this.loaded(lqItem);
            });
        });
    }

    private loaded(lqI: LoadingQueueType) {
        // Set loaded flag to true
        lqI.loaded = true;

        // Save the load time for debugging purposes on dev
        const loadTime = new Date();
        if (isDev)
            console.info(
                `${
                    lqI.eventName
                } has finished loading at: ${loadTime.toLocaleTimeString()}`
            );

        // If there's any item that has not loaded yet return and break flow
        for (const i in this.loadingqueue) {
            if (!this.loadingqueue[i].loaded) return false;
        }

        // Emit preload-finished which starts the main (GameWindow) proces
        ipcMain.emit("preload-finished");
    }
}
