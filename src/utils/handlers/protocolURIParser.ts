import { ActionStrings, ActionType, ProtocolType } from "../../types";
import { APClientSettings } from "../APClientSettings";
import { consoleLogger } from "../logger";

/**
 * Handles the protocol.
 * Checking is done inside this.
 * @param args The (CLI) arguments (string[])
 * @returns ProtocolType or null if no action is found
 */
export const protocolURIParser = (args: string[]): ProtocolType => {
    consoleLogger.log("Protocol Handler: " + args.toString());
    for (const i in args) {
        // Split the arg by = and return the string after =
        if (args[i].startsWith(APClientSettings.PROTOCOL_PREFIX)) {
            // strip off the protocol and separate by /
            const temp = args[i].substr(APClientSettings.PROTOCOL_PREFIX.length + 3).split("/");

            if (ActionStrings.includes(temp[0])) {
                if (!isNaN(Number.parseInt(temp[1], 10))) {
                    return {
                        action: temp[0] as ActionType,
                        parameter: Number.parseInt(temp[1], 10)
                    };
                }
            }
        }
    }

    return null;
};
