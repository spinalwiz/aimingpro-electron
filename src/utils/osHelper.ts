import { OSType } from "../types";
import * as OS_Native from "os";

function os(): OSType {
    if (process.platform === "win32") return OSType.WIN;
    if (process.platform === "darwin") return OSType.MAC;
    if (process.platform === "linux" || process.platform === "freebsd" || process.platform === "openbsd") return OSType.LINUX;
}

export const isAMDCPU = OS_Native.cpus()[0].model.indexOf("AMD");

export const osHelper = os();
