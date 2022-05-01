import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
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
      logLevel:   'debug',
      privateKey: readFileSync('privateKey.pem'),
      publicKey:  readFileSync('publicKey.pem'),
      idpAppUrl: 'http://localhost:3000/authorize',
      idpApiUrl: 'http://localhost:3001',
    },
  }, redis);

  const permis = new p.PermisService(conf);

  async function authorize(req: Request, res: Response) {
    try {
      const formData = Object.assign({}, req.body, req.query) as Partial<p.oauth2.IRequestToAuthorize>;
      const result = await permis.authorize(formData);
      const uri = result.redirect_uri ? result.redirect_uri.toString() : '';
      console.debug({ uri });
      if (result.success) {
        console.info(result.success);
        if ('consent_id' in result.success) {
          console.debug('step to START consent user journey...');
          // next: redirect to IdP app, user should authenticate + update consent allow/deny
        } else if ('code' in result.success) {
          console.debug('step to FINISH consent user journey...');
          // next: redirect to Client app, it should use auth code to get access token
        }
      } else {
        console.warn(result.error);
      }
      if (uri) res.redirect(uri);
      else res.json(result.error ?? { error: 'failed' });
    } catch (err) {
      res.json({ error: err instanceof Error ? err.message : 'Server error' });
    }
  }

  async function authenticate(req: Request, res: Response) {
    try {
      let token = '', token_type = 'bearer';
      const headerToken = req.get('Authorization');
      if (!headerToken) return res.status(401).json({ error: 'Unauthorized' });
      const parts = headerToken.split(' ');// 'Bearer TOKEN'
      token_type  = parts[0];
      token       = parts[1];
      const result = await permis.authenticate({ token }); // TODO: include token type?
      if (result.success) return res.json(result.success);
      return res.json(result.error); // TODO: set status?
    } catch (err) {
      console.warn(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async function createToken(req: Request, res: Response) {
    try {
      const formData = Object.assign({}, req.query) as Partial<p.oauth2.IRequestToCreateToken>;
      const result = await permis.createToken(formData);
      if (result.success) {
        res.json(result.success);
      } else if (result.error) {
        res.json(result.error);
      }
    } catch (err) {
      console.warn(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async function getConsumer(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const data = await permis.conf.consumerService.find(id);
      res.json({ data });
    } catch (err) {
      console.warn(err);
      res.json({ error: 'Failed to get consumer details' });
    }
  }

  async function getClient(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const data = await permis.conf.clientService.find(id);
      res.json({ data });
    } catch (err) {
      res.json({ error: 'Failed to get client details' });
    }
  }

  async function getConsent(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const consent  = await permis.conf.consentService.find(id);
      const client   = await permis.conf.clientService.find(consent.client_id);
      const consumer = await permis.conf.clientService.find(client.consumer_id);
      const data = {
        consumer: { name: consumer.name },
        client:   { name: client.name },
        scopes:   consent.scope.split(' ').map(code => ({ code, description: code.replace(':', ' ') })),
      };
      res.json({ data });
    } catch (err) {
      res.json({ error: 'Failed to get consent details' });
    }
  }

  async function updateConsent(req: Request, res: Response) {
    try {
      let token = '', token_type = 'bearer';
      const headerToken = req.get('Authorization');
      if (!headerToken) return res.status(401).json({ error: 'Unauthorized' });
      const parts = headerToken.split(' ');// 'Bearer TOKEN'
      token_type  = parts[0];
      token       = parts[1];
      const userResult = await permis.authenticate({ token }); // TODO: include token type?
      const { user_id = '' } = userResult.success ?? {};
      if (!userResult.success || user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id = '' } = req.params;
      const { is_granted = 0, client_id = '', redirect_uri = '', scope = '', state = '' } = req.body;
      const found = await permis.conf.consentService.find(id); // throws error
      if (found.client_id !== client_id) {
        console.debug('client_id mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.redirect_uri !== redirect_uri) {
        console.debug('redirect_uri mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.scope !== scope) {
        console.debug('scope mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.state !== state) {
        console.debug('state mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.user_id) {
        console.debug('user_id already entered');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (![0, 1].includes(is_granted)) {
        console.debug('allow is invalid');
        return res.status(400).json({ error: 'Bad request' });
      }
      // TODO: expires_at a future date
      const change = { user_id, is_granted };
      const data = await permis.conf.consentService.update(id, change);
      res.json({ data });
    } catch (err) {
      res.json({ error: err instanceof Error ? err.message : 'Failed to update consent' });
    }
  }

  server.post('/oauth2/authorize',     authorize);
  server.post('/oauth2/authenticate',  authenticate);
  server.post('/oauth2/tokens',        createToken);
  server.get('/oauth2/consumers/:id',  getConsumer);
  server.get('/oauth2/clients/:id',    getClient);
  server.get('/oauth2/consents/:id',   getConsent);
  server.patch('/oauth2/consents/:id', updateConsent);

  return { conf, redis, server, permis };
}
