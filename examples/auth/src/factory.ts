import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { createClient } from 'redis';
import { makeRoutes } from './routes';
import * as p from './permis';
import { IEnvSettings, IFactory } from './types';

export async function factory(penv: IEnvSettings): Promise<IFactory> {
  const server = express();

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  const redis = createClient({
    url: penv.REDIS_URL ?? 'redis://localhost:6379',
  });

  await redis.connect();

  const conf = new p.PermisConfigWithRedis({
    logLevel:   'debug',
    privateKey: readFileSync('privateKey.pem'),
    publicKey:  readFileSync('publicKey.pem'),
    selfHosted: true,
    //idpAppUrl: 'http://localhost:3000/authorize',
    //idpApiUrl: 'http://localhost:3001',
  }, redis);

  const permis = new p.PermisService(conf);  

  const repos = {
    authCodeRepo: conf.authCodeRepo,
    clientRepo:   conf.clientRepo,
    consentRespo: conf.consentRepo,
    consumerRepo: conf.consumerRepo,
    identityRepo: conf.identityRepo,
    scopeRepo:    conf.scopeRepo,
    tokenRepo:    conf.tokenRepo,
  };

  const f = { conf, redis, server, permis, repos }

  server.use(makeRoutes(f, Router())._router);

  return f;
}
