import { ActionType, ParameterType, ProtocolType } from "../../types/AimingproProtocol";
import { constant } from "./../constant";

/**
 * Handles the protocol.
 * Checking is done inside this.
 * @param k Key to look for (string)
 * @param arg The CLI arguments (string[])
 * @returns ProtocolType
 */
export const protocolHandler = (args : string[]) : ProtocolType => {
    for(const i in args){
        // Split the arg by = and return the string after =
        if(args[i].startsWith(constant.PROTOCOL_PREFIX)){
            let action : ActionType;
            let parameter : ParameterType;

            // Strip away the protocol
            let temp : string[] = args[i].split('//');

            // If no parameter
            if(temp.length < 2) break;

            // Split by slashes after protocol
            temp = temp[1].split('/');

            // TODO: Needs a more flexible but strict approach (type aliases didn't work).

            // If Game Action
            if(temp[0] === 'game'){
                action = temp[0];
                // Check if valid numeric value
                if(!isNaN(parseInt(temp[1], 10)) ){
                    parameter = temp[1];
                    return {action, parameter};
                }
            };

            break;
        }
    }

    return null;
};