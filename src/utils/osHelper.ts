import { OSType } from "../types";

function os(): OSType {
    if (process.platform === "win32") return OSType.WIN;
    if (process.platform === "darwin") return OSType.MAC;
    if (process.platform === "linux" || process.platform === "freebsd" || process.platform === "openbsd") return OSType.LINUX;
}

export const osHelper = os();
