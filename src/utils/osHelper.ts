import { osType } from "../types";

function os(): osType {
    if (process.platform === "win32") return "win";
    if (process.platform === "darwin") return "mac";
    if (process.platform === "linux" || process.platform === "freebsd" || process.platform === "openbsd") return "linux";
}

export const osHelper = os();
