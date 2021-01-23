import { APClientSettings } from "./APClientSettings";

export const parsePageFromTitle = (title: string): string =>
    title.split(APClientSettings.TITLE_SEPARATOR)[0] !== "Aiming.Pro "
        ? title.split(APClientSettings.TITLE_SEPARATOR)[0]
        : APClientSettings.ACTIVITY_DESCRIPTION_FALLBACK;
