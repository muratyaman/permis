import { Request, Response, Router } from 'express';
import * as p from '../../permis';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  async function createToken(req: Request, res: Response) {
    try {
      const formData = Object.assign({}, req.query) as Partial<p.oauth2.IRequestToCreateToken>;
      const result = await permis.createToken(formData);
      if (result.success) {
        res.json(result.success);
      } else if (result.error) {
        res.json(result.error); // TODO: status
      }
    } catch (err) {
      console.warn(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  _router.post('/', createToken);

  return { _router, createToken };
}
