import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { createClient } from 'redis';
import * as p from './permis';

const tokenExpiry1h = 3600;

export async function makeServer(penv = process.env) {
  const server = express();

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(express.json());
  server.use(cors());
  server.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    return next();
  });

  const redis = createClient({
    url: penv.REDIS_URL ?? 'redis://localhost:6379',
  });

  console.log('connecting to redis...');
  await redis.connect();
  console.log('connecting to redis... done!');

  const identityRepo = new p.RepoWithRedis<p.IIdentityDto>('oauth2_users', redis);

  const privateKey = readFileSync('privateKey.pem');
  const publicKey = readFileSync('publicKey.pem');

  const securityService = new p.SecurityServiceDefault(privateKey, publicKey);

  async function generateJwt(user_id: string): Promise<string> {
    return securityService.generateJwt({ client_id: 'self', user_id, scope: 'profile' }, tokenExpiry1h);
  }

  async function verifyUser(username: string, password: string): Promise<p.IIdentityDto> {
    const users = await identityRepo.findMany({ username });
    if (!users.length) throw new Error('Invalid user credentials');

    const user = users[0];

    const verified = await securityService.verifyText(password, user.password_hash);
    if (!verified) throw new Error('Invalid user credentials');
    return user;
  }

  async function signUp(req: Request, res: Response) {
    const username = req.body.username ?? '';
    const password = req.body.password ?? '';
    const password_confirm = req.body.password_confirm ?? '';
    try {
      if (!username || !password || (password !== password_confirm)) throw new Error('Invalid request');
      const password_hash = await securityService.hashText(password);

      // validate: username must be unique
      const rows = await identityRepo.findMany({ username });
      if (rows && rows.length) throw new Error('Username is not unique');

      const id = randomUUID();
      const created = await identityRepo.create(id, { id, username, password_hash });
      if (!created) throw new Error('Sign up failed');
      const token = await generateJwt(id);
      const data = { user_id: id, username, token };
      res.json({ data });
    } catch (err) {
      res.json({ error: err instanceof Error ? err.message : 'Sign up failed' });
    }
  }

  async function signIn(req: Request, res: Response) {
    const username = req.body.username ?? '';
    const password = req.body.password ?? '';
    try {
      const user = await verifyUser(username, password);
      const token = await generateJwt(user.id);
      const data = { user_id: user.id, username, token };
      res.json({ data });
    } catch (err) {
      res.json({ error: err instanceof Error ? err.message : 'Sign in failed' });
    }
  }

  async function me(req: Request, res: Response) {
    const authHeader = req.get('authorization') ?? '';
    const [kind, token] = authHeader.split(' ');
    if (kind && token) {
      const data = await securityService.verifyJwt(token);
      if (data && data.user_id) {
        return res.json({ data });
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }

  server.post('/sign-up', signUp);
  server.post('/sign-in', signIn);
  server.post('/me', me);

  return server;
}
