// Keep it extensible for later features
export type ActionType = "game" | "page";
export type ParameterType = number | string;

export interface ProtocolType {
    action: ActionType,
    parameter: ParameterType
}