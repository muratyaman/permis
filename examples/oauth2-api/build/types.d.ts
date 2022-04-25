export declare type IConsole = typeof console;
export declare type IProcessEnv = typeof process.env;
export interface IEnvSettings extends IProcessEnv {
    REDIS_URL?: string;
}
