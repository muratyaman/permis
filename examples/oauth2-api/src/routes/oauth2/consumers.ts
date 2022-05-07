import { Request, Response, Router } from 'express';
import * as p from '../../permis';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  async function getConsumer(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const data = await permis.conf.consumerService.retrieve(id);
      res.json({ data });

    } catch (err) {

      console.warn(err);
      res.json({ error: 'Failed to get consumer details' }); // TODO: status
    }
  }

  _router.get('/:id', getConsumer);

  return { _router, getConsumer };
}
