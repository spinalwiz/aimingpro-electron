/**
 * Fixes the pointerlock by getting into the iFrame and setting the release event there
 * @param document the iFrame document
 * @return true if successfully injected event
 */
export const modalPointerlockFix = (document: Document): boolean => {
    // If game has started as a MODAL
    const selector = "#game-container";
    if (document.querySelector(selector) !== null) {

        const el = document.querySelector(selector) as HTMLIFrameElement;

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
        return true;
    } else {
        return false;
    }
}

export const pointerLockFix = (document: Document): void => {
    document.body.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (document.pointerLockElement) {
                document.exitPointerLock();
                e.stopPropagation();
            }
        }
    });
}