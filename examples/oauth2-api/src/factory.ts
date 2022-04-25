import express from 'express';
import bodyParser from 'body-parser';
import objGet from 'lodash/get';
import { readFileSync } from 'fs';
import { createClient } from 'redis';
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
      logLevel: 'debug',
      privateKey: readFileSync('privateKey.pem'),
      publicKey:  readFileSync('publicKey.pem'),
      idpAppUrl:  'http://localhost:3000/authorize',
      idpApiUrl:  'http://localhost:3001',
    },
  }, redis);

  const permis = new p.PermisService(conf);

  server.post('/oauth2/authorize', async(req, res) => {
    const formData = Object.assign({}, req.body, req.query);
    // TODO: validate formData
    const response_type: string = String(objGet(formData, 'response_type', 'code'));
    const client_id: string     = String(objGet(formData, 'client_id', ''));
    const redirect_uri: string  = String(objGet(formData, 'redirect_uri', ''));
    const scope: string         = String(objGet(formData, 'scope', ''));
    const state: string         = String(objGet(formData, 'state', ''));

    const result = await permis.authorize({
      response_type,
      client_id,
      redirect_uri,
      scope,
      state,
    });

    if (result.success) {
      if ('consent_id' in result.success) { // step to START consent user journey
        res.redirect(result.redirect_uri.toString()); // next: authenticate + give consent
      } else if ('code' in result.success) { // step to FINISH consent user journey
        res.redirect(result.redirect_uri.toString()); // next: use auth code for access token
      }
    } else {
      res.json(result.error);
    }
  });

  server.post('/oauth2/authenticate', async(req, res) => {
    let token = '', token_type = 'bearer';
    const headerToken = req.get('Authorization');
    if (headerToken) {
      const parts = headerToken.split(' ');// 'Bearer TOKEN'
      token_type = parts[0];
      token      = parts[1];
    } else {
      const formData = Object.assign({}, req.body, req.query);
      // TODO: validate formData
      token = String(objGet(formData, 'access_token', ''));
    }
    const result = await permis.authenticate({ token }); // TODO: include token type?

    if (result.success) {
      res.json(result.success);
    } else if (result.error) {
      res.json(result.error); // TODO: set status?
    } else {
      res.status(500).json({ error: 'Server error' });
    }

  });

  server.post('/oauth2/tokens', async(req, res) => {
    const grant_type: string    = String(objGet(req.query, 'grant_type', ''));
    const code: string          = String(objGet(req.query, 'code', ''));
    const client_id: string     = String(objGet(req.query, 'client_id', ''));
    const client_secret: string = String(objGet(req.query, 'client_secret', ''));
    const redirect_uri: string  = String(objGet(req.query, 'redirect_uri', ''));

    // TODO: cover scenario for using refresh token

    const result = await permis.token({
      grant_type,
      code,
      client_id,
      client_secret,
      redirect_uri,
    });

    if (result.success) {
      res.json(result.success);
    } else if (result.error) {
      res.json(result.error);
    } else {
      res.status(500).json({ error: 'Server error' });
    }

  });

  return { server, permis };
}
