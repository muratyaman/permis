import { Request, Response, Router } from 'express';
import * as p from '../../permis';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  // localize
  const idp = f.permis.conf.identityService;
  const sec = f.permis.conf.securityService;

  // for user to sign in: create login/session token
  async function createToken(req: Request, res: Response) {
    try {
      let { username = '', password = '' } = req.body;
      username = p.assertString(username, 'username required');
      password = p.assertString(password, 'password required');

      const user = await idp.findByUsername(username);
      const verified = await sec.verifyText(password, user.password_hash);

      if (verified) {
        const token = await sec.generateJwt({
          client_id: 'self',
          user_id:   user.id,
          scope:    'profile:read',
          issuer:   'my-idp',
        });
        res.json({ token, data: { ...user, password_hash: undefined } });
      }

    } catch (err) {

      console.warn(err);
      res.json({ error: 'Server error' });
    }
  }

  // to verify login/session token
  async function checkToken(req: Request, res: Response) {
    try {
      const bearerToken = req.get('authorization');
      const [_kind, token] = String(bearerToken).split(' ');

      const decoded = await sec.verifyJwt(token);
      res.json({ data: decoded });

    } catch (err) {

      console.warn(err);
      res.json({ error: 'Server error' });
    }
  }

  _router.post('/');
  _router.get ('/');

  return { _router, createToken, checkToken };
}
