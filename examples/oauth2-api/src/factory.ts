import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { createClient } from 'redis';
import { makeRoutes } from './routes';
import * as p from './permis';
import { IFactory } from './types';

export async function factory(penv = process.env): Promise<IFactory> {
  const server = express();

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  const redis = createClient({
    url: penv.REDIS_URL ?? 'redis://localhost:6379',
  });

  await redis.connect();

  const conf = new p.PermisConfigWithRedis({
    options: {
      logLevel:   'debug',
      privateKey: readFileSync('privateKey.pem'),
      publicKey:  readFileSync('publicKey.pem'),
      selfUrl:    'http://localhost:8000',
      //idpAppUrl: 'http://localhost:3000/authorize',
      //idpApiUrl: 'http://localhost:3001',
    },
  }, redis);

  const authCodeRepo = new p.RepoWithRedis<p.IAuthCodeDto>('oauth2_auth_codes', redis);
  const clientRepo   = new p.RepoWithRedis<p.IClientDto>  ('oauth2_clients',    redis);
  const consentRespo = new p.RepoWithRedis<p.IConsentDto> ('oauth2_consents',   redis);
  const consumerRepo = new p.RepoWithRedis<p.IConsumerDto>('oauth2_consumers',  redis);
  const identityRepo = new p.RepoWithRedis<p.IIdentityDto>('oauth2_identity',   redis);
  const scopeRepo    = new p.RepoWithRedis<p.IScopeDto>   ('oauth2_scopes',     redis);
  const tokenRepo    = new p.RepoWithRedis<p.ITokenDto>   ('oauth2_tokens',     redis);

  const permis = new p.PermisService(conf);  

  const repos = {
    authCodeRepo,
    clientRepo,
    consentRespo,
    consumerRepo,
    identityRepo,
    scopeRepo,
    tokenRepo,
  };

  const f = { conf, redis, server, permis, repos }

  server.use(makeRoutes(f, Router())._router);

  return f;
}
