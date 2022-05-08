import { Request, Response, Router } from 'express';
import { sendError } from '../../errors';
import * as p from '../../permis';
import { ErrBadRequest, PermisError } from '../../permis';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  // localize
  const idp = f.permis.conf.identityService;
  const sec = f.permis.conf.securityService;

  async function signUp(req: Request, res: Response) {
    try {
      const username         = p.objectPropAsString(req.body, 'username', '');
      const password         = p.objectPropAsString(req.body, 'password', '');
      const password_confirm = p.objectPropAsString(req.body, 'password_confirm', '');
      p.assertString(username, 'username required');
      p.assertString(password, 'password required');
      p.assertString(password_confirm, 'password confirmation required');
      if (password !== password_confirm) throw new ErrBadRequest('')

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
      sendError(req, res, err);
    }
  }

  _router.post('/', signUp);

  return { _router, signUp };
}
