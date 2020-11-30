import { app } from "electron";

// TODO: delegate to a config?
const HOSTNAME = "aiming.pro";

export const constant = {
    hostname: HOSTNAME,
    baseUrl: "https://" + HOSTNAME + "/",
    gameBaseUrl: "https://" + HOSTNAME + "/3dGame/index.html?id=",
    // ALSO NEEDS CHANGING IN installer.nhs IF CHANGING
    PROTOCOL_PREFIX: "aimingpro",
    userAgentSuffix: " aiming-pro-client",
    /* Discord */
    DISCORD_CLIENTID: "708019597483442218",
    DISCORD_BIGPICID: "logo",
    ACTIVITY_DESCRIPTION_FALLBACK: "General",
    // Used to parse the title
    TITLE_SEPARATOR: "|",
};
