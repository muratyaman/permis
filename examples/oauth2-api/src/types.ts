export type IConsole = typeof console;

export type IProcessEnv = typeof process.env;

export interface IEnvSettings extends IProcessEnv {
  REDIS_URL?: string;
}

export interface IConsentDetails {
  consumer: { name: string; web_url?: string; icon_url?: string; };
  client:   { name: string; web_url?: string; };
  scopes:   { code: string; description: string; };
}
