import express, { Request, Response } from 'express';
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

  async function authorize(req: Request, res: Response) {
    const formData = Object.assign({}, req.body, req.query);
    // TODO: validate formData

    const result = await permis.authorize({
      response_type: String(objGet(formData, 'response_type', 'code')),
      client_id:     String(objGet(formData, 'client_id', '')),
      redirect_uri:  String(objGet(formData, 'redirect_uri', '')),
      scope:         String(objGet(formData, 'scope', '')),
      state:         String(objGet(formData, 'state', '')),
    });

    const uri = result.redirect_uri.toString();

    if (result.success) {
      console.info(result.success);
      if ('consent_id' in result.success) {
        console.debug('step to START consent user journey...');
        // next: IdP app should authenticate + give consent
      } else if ('code' in result.success) {
        console.debug('step to FINISH consent user journey...');
        // next: Client should use auth code for access token
      }
    } else {
      console.error(result.error);
    }
    console.info({ uri });
    res.redirect(uri);
  }

  async function authenticate(req: Request, res: Response) {
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
  }

  async function tokens(req: Request, res: Response) {
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
  }

  server.post('/oauth2/authorize',    authorize);
  server.post('/oauth2/authenticate', authenticate);
  server.post('/oauth2/tokens',       tokens);

  return { conf, redis, server, permis };
}
