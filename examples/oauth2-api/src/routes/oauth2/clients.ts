import { Request, Response, Router } from 'express';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  async function getClient(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const data = await f.permis.conf.clientService.retrieve(id);
      res.json({ data });
    } catch (err) {
      res.json({ error: 'Failed to get client details' }); // TODO: status
    }
  }

  _router.get('/:id', getClient);

  return { _router, getClient };
}
