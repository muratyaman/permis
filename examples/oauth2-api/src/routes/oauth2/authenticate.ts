import { Request, Response, Router } from 'express';
import * as p from '../../permis';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  async function authenticate(req: Request, res: Response) {
    try {
      let token = '', token_type = 'bearer';
      const headerToken = req.get('Authorization');
      if (!headerToken) return res.status(401).json({ error: 'Unauthorized' });

      const parts = headerToken.split(' ');// 'Bearer TOKEN'
      if (!parts || !parts.length) return res.status(401).json({ error: 'Unauthorized' });

      token_type  = parts[0].toLowerCase();
      token       = parts[1];
      const result = await permis.authenticate({ token, token_type });

      if (result.success) return res.json(result.success);
      return res.status(401).json(result.error);

    } catch (err) {

      console.warn(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  _router.post('/');

  return { _router, authenticate };
}
