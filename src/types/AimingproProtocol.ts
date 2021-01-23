// Keep it extensible for later features

// One needed for the checks and one for the return type
// Unfortunately TS can't infer type aliases from a string array
export const ActionStrings = ["game", "page", "playlist"];
export type ActionType = "game" | "page" | "playlist";

export type ParameterType = number;

export interface ProtocolType {
    action: ActionType;
    parameter: ParameterType;
}
