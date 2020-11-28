import { constant } from "./constant";
export const parsePageFromTitle = (title: string): string =>
    title.split(constant.TITLE_SEPARATOR)[0] !== "Aiming.Pro "
        ? title.split(constant.TITLE_SEPARATOR)[0]
        : constant.ACTIVITY_DESCRIPTION_FALLBACK;
