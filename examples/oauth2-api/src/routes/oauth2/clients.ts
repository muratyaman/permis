import { Request, Response, Router } from 'express';
import * as p from '../../permis';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  async function getClient(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const data = await permis.conf.clientService.retrieve(id);
      res.json({ data });
    } catch (err) {
      res.json({ error: 'Failed to get client details' }); // TODO: status
    }
  }

  _router.get('/:id', getClient);

  return { _router, getClient };
}
