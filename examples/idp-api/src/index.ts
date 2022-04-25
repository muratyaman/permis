import express from 'express';
import bodyParser from 'body-parser';
import objGet from 'lodash/get';
import { readFileSync } from 'fs';
import { createClient } from 'redis';
import * as p from '../../oauth2-api/src/permis';

main();

async function main(penv = process.env) {
  const server = express();

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());

  const redis = createClient({
    url: penv.REDIS_URL ?? 'redis://localhost:6379',
  });

  await redis.connect();

  const identityRepo = new p.RepoWithRedis<p.IIdentityDto>('oauth2_users', redis);

  const privateKey = readFileSync('privateKey.pem');
  const publicKey  = readFileSync('publicKey.pem');

  const securityService = new p.SecurityServiceDefault(privateKey, publicKey);

  async function verifyUser(username: string, password: string): Promise<p.IIdentityDto> {
    const users = await identityRepo.findMany({ username });
    if (!users.length) throw new Error('Invalid user credentials');

    const user = users[0];

    const verified = await securityService.verifyText(password, user.password_hash);
    if (!verified) throw new Error('Invalid user credentials');
    return user;
  }

  server.post('/login', async(req, res) => {
    const username = req.body.username ?? '';
    const password = req.body.password ?? '';
    try {
      const user = await verifyUser(username, password);
      const token = await securityService.generateJwt({
        client_id: user.id,
        user_id: user.id,
        scope: 'profile',
      }, 60 * 5);
      res.json({
        user_id: user.id,
        token,
      })
    } catch (err) {
      res.json({ error: err instanceof Error ? err.message : 'Login failed' });
    }
  });

  server.post('/me', async(req, res) => {
    // TODO: take token from auth header, decode it and return output
  });

  server.listen(3001, () => console.log('IdP service is ready at http://localhost:3001'));
}
