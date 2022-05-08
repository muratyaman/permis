import { Application } from 'express';
import * as p from './permis';

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

export interface IFactory {
  conf:   p.PermisConfigWithRedis;
  redis:  p.RedisClient;
  permis: p.PermisService;
  server: Application;
  repos: {
    authCodeRepo: p.RepoWithRedis<p.IAuthCodeDto>;
    clientRepo  : p.RepoWithRedis<p.IClientDto>;
    consentRespo: p.RepoWithRedis<p.IConsentDto>;
    consumerRepo: p.RepoWithRedis<p.IConsumerDto>;
    identityRepo: p.RepoWithRedis<p.IIdentityDto>;
    scopeRepo   : p.RepoWithRedis<p.IScopeDto>;
    tokenRepo   : p.RepoWithRedis<p.ITokenDto>;
  };
}
