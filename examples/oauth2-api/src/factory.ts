import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { createClient } from 'redis';
import { makeRoutes } from './routes';
import * as p from './permis';

export async function factory(penv = process.env) {
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

  const identityRepo = new p.RepoWithRedis('oauth_identity', redis);
  const identityRepo = new p.RepoWithRedis('oauth_identity', redis);
  const identityRepo = new p.RepoWithRedis('oauth_identity', redis);
  const identityRepo = new p.RepoWithRedis('oauth_identity', redis);
  const identityRepo = new p.RepoWithRedis('oauth_identity', redis);

  const permis = new p.PermisService(conf);  

  server.use(makeRoutes(permis, Router())._router);

  return { conf, redis, server, permis, identityRepo };
}
