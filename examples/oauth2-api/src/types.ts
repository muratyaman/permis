export type IConsole = typeof console;

export type IProcessEnv = typeof process.env;

export interface IEnvSettings extends IProcessEnv {
  REDIS_URL?: string;
}
